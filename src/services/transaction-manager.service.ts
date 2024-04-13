import { TransactionModel } from '../domain/transaction.model';
import { MoneyModel } from '../domain/money.model';
import { AccountsRepository } from '../repository/accounts.repository';
import dayjs from 'dayjs';
import { getConversionRate } from '../utils/money.utils';
import { CheckingAccountModel } from '../domain/checking-account.model';
import { AccountType } from '../domain/account-type.enum';

export class TransactionManagerService {
  public transfer(fromAccountId: string, toAccountId: string, value: MoneyModel): TransactionModel {
    const fromAccount = AccountsRepository.get(fromAccountId);
    const toAccount = AccountsRepository.get(toAccountId);
    const bankCard = (fromAccount as CheckingAccountModel).associatedCard!;

    // checking if account exists
    if (!fromAccount || !toAccount) {
      throw new Error('Specified account does not exist');
    }

    // in order to check the account's daily transaction amount limit later, every account should have a bankCard attached to it
    if (!bankCard) {
      throw new Error('Your account does not have a bankcard attached. Please add your card now!');
    }

    // handling forbidden transfer functionalities SAVINGS => CHECKING
    if (fromAccount.accountType === AccountType.SAVINGS && toAccount.accountType === AccountType.CHECKING) {
      throw new Error('You cannot perform the transfer functionality between the following types of accounts: SAVINGS => CHECKING');
    }

    // handling forbidden transfer functionalities SAVINGS => SAVINGS
    if (fromAccount.accountType === AccountType.SAVINGS && toAccount.accountType === AccountType.SAVINGS) {
      throw new Error('You cannot perform the transfer functionality between the following types of accounts: SAVINGS => SAVINGS');
    }

    // handling currency conversions both for accounts and for the value transferred
    if (toAccount.balance.currency !== value.currency) {
      let conversionRate = getConversionRate(value.currency, toAccount.balance.currency);
      value.amount *= conversionRate; // converting the money sent
      value.currency = toAccount.balance.currency; // setting the final currency's name
    } 

    // handling negative account balance and checking if there is enough of the required currency to be sent
    if (fromAccount.balance.amount < (value.currency !== fromAccount.balance.currency ? 
    value.amount * getConversionRate(value.currency, fromAccount.balance.currency) : value.amount)) {
      throw new Error('Not enough funds available. Transfer is not allowed!');
    }

    // calculating daily transaction amount for handling the daily transaction amount limit.
    if (fromAccount.accountType === AccountType.CHECKING) {
      let dailyTransactioinAmount = 0;
      for (const dailyTransaction of fromAccount.transactions) {
        const transactionDate = dayjs(dailyTransaction.timestamp);
        const currentDate = dayjs();
        // checking if the daily transactions were made from the specific account
        if (transactionDate.isSame(currentDate, 'day') && dailyTransaction.from === fromAccountId) {
          dailyTransactioinAmount += dailyTransaction.amount.amount;
        }
      }

      // handling daily transaction amount limit
      if ((dailyTransactioinAmount + value.amount) > bankCard.dailyWithdrawalLimit) {
        throw new Error(`Daily withdrawal limit exceeded. You can transfer up to 
        ${bankCard.dailyWithdrawalLimit - dailyTransactioinAmount} ${fromAccount.balance.currency} today. 
        Your current plan's limit is ${bankCard.dailyWithdrawalLimit} ${fromAccount.balance.currency}. 
        If you want to send more money, please update your plan.`);
      }
    }

    const transaction = new TransactionModel({
      id: crypto.randomUUID(),
      from: fromAccountId,
      to: toAccountId,
      amount: value,
      timestamp: dayjs().toDate(),
    });

    fromAccount.balance.amount -= value.amount;
    fromAccount.transactions = [...fromAccount.transactions, transaction];
    toAccount.balance.amount += value.amount;
    toAccount.transactions = [...toAccount.transactions, transaction];

    fromAccount.balance.amount = Math.round(fromAccount.balance.amount * 100) / 100;
    toAccount.balance.amount = Math.round(toAccount.balance.amount * 100) / 100;


    return transaction;
  }

  public withdraw(accountId: string, amount: MoneyModel): TransactionModel {
    const withdrawAccount = AccountsRepository.get(accountId);
    const bankCard = (withdrawAccount as CheckingAccountModel).associatedCard!;

    if (!withdrawAccount) {
      throw new Error('Specified account does not exist');
    }

    // in order to check the account's daily transaction amount limit later, every account should have a bankCard attached to it
    if (!bankCard) {
      throw new Error('Your account does not have a bankcard attached. Please add your card now!');
    }

    // handling currency conversions both for the withdraw account and for the amount (value)
    if (withdrawAccount.balance.currency !== amount.currency) {
      let conversionRate = getConversionRate(amount.currency, withdrawAccount.balance.currency);
      amount.amount *= conversionRate; // converting the money sent
      amount.currency = withdrawAccount.balance.currency;
    }

    // handling negative account balance
    if (withdrawAccount.balance.amount < amount.amount) {
      throw new Error('Not enough funds available. Withdrawal is not allowed!');
    }


    if (withdrawAccount.accountType === AccountType.CHECKING) {
      // handling inactive expired card
      if (!bankCard.active && dayjs(bankCard?.expirationDate) < dayjs()) {
        throw new Error('Your bankcard is inactive or expired. Please activate it or renew your card!');
      }

      // warning if the card expires on the transaction's date, but let them transactionate
      if (bankCard.active && dayjs(bankCard.expirationDate) === dayjs()) {
        console.log(`WARNING: Bankcard ${bankCard} will expire today!`);
      }
      
      // calculating daily transaction amount for handling the daily transaction amount limit.
      let dailyTransactioinAmount = 0;
      for (const dailyTransaction of withdrawAccount.transactions) {
        const transactionDate = dayjs(dailyTransaction.timestamp);
        const currentDate = dayjs();
        // checking if the daily transactions were made from the specific account (from his/her account)
        if (transactionDate.isSame(currentDate, 'day') && dailyTransaction.from === accountId) {
          dailyTransactioinAmount += dailyTransaction.amount.amount;
        }
      }

      // handling daily transaction amount limit
      if ((dailyTransactioinAmount + amount.amount) > bankCard.dailyWithdrawalLimit) {
        throw new Error(`Daily withdrawal limit exceeded. You can transfer up to 
        ${bankCard.dailyWithdrawalLimit - dailyTransactioinAmount} ${withdrawAccount.balance.currency} today. 
        Your current plan's limit is ${bankCard.dailyWithdrawalLimit} ${withdrawAccount.balance.currency}. 
        If you want to send more money, please update your plan.`);
      }

    }
    const transaction = new TransactionModel({
      id: crypto.randomUUID(),
      from: withdrawAccount.id,
      to: withdrawAccount.id,
      amount: amount,
      timestamp: dayjs().toDate(),
    });

    withdrawAccount.balance.amount -= amount.amount;
    withdrawAccount.transactions = [...withdrawAccount.transactions, transaction];

    return transaction;
  }

  public checkFunds(accountId: string): MoneyModel {
    if (!AccountsRepository.exist(accountId)) {
      throw new Error('Specified account does not exist');
    }
    return AccountsRepository.get(accountId)!.balance;
  }

  public retrieveTransactions(accountId: string): TransactionModel[] {
    if (!AccountsRepository.exist(accountId)) {
      throw new Error('Specified account does not exist');
    }
    return AccountsRepository.get(accountId)!.transactions;
  }
}

export const TransactionManagerServiceInstance = new TransactionManagerService();
