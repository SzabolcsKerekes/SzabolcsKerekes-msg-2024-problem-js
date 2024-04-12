import { TransactionModel } from '../domain/transaction.model';
import { MoneyModel } from '../domain/money.model';
import { AccountsRepository } from '../repository/accounts.repository';
import dayjs from 'dayjs';
import { getConversionRate } from '../utils/money.utils';

export class TransactionManagerService {
  public transfer(fromAccountId: string, toAccountId: string, value: MoneyModel): TransactionModel {
    const fromAccount = AccountsRepository.get(fromAccountId);
    const toAccount = AccountsRepository.get(toAccountId);

    if (!fromAccount || !toAccount) {
      throw new Error('Specified account does not exist');
    }

    // handling forbidden transfer functionalities SAVINGS => CHECKING
    if (fromAccount.accountType == "SAVINGS" && toAccount.accountType == "CHECKING") {
      throw new Error('You cannot perform the transfer functionality between the following types of accounts: SAVINGS => CHECKING');
    }

    // handling forbidden transfer functionalities SAVINGS => SAVINGS
    if (fromAccount.accountType == "SAVINGS" && toAccount.accountType == "SAVINGS") {
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

    return transaction;
  }

  public withdraw(accountId: string, amount: MoneyModel): TransactionModel {
    throw new Error('Not implemented');
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
