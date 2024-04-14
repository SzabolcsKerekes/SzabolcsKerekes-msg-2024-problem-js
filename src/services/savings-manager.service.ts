import { AccountsRepository } from '../repository/accounts.repository';
import { AccountType } from '../domain/account-type.enum';
import { SavingsAccountModel } from '../domain/savings-account.model';
import dayjs from 'dayjs';
import { CapitalizationFrequency } from '../domain/capitalization-frequency.enum';
import { InterestRate } from '../domain/interest-rate.enum';

export class SavingsManagerService {
  private systemDate = dayjs().toDate();
  public passTime(): void {
    const savingAccounts = AccountsRepository.getAll().filter(
      account => account.accountType === AccountType.SAVINGS
    ) as SavingsAccountModel[];

    const nextSystemDate = dayjs(this.systemDate).add(1, 'months');

    savingAccounts.forEach(savingAccount => {
      if (savingAccount.interestFrequency === CapitalizationFrequency.MONTHLY) {
        this.addMonthlyInterest(savingAccount, nextSystemDate);
      } else if (savingAccount.interestFrequency === CapitalizationFrequency.QUARTERLY) {
        this.addQuarterlyInterest(savingAccount, nextSystemDate);
      }
    });

    this.systemDate = nextSystemDate.toDate();
  }

  // handling account lifetime
  // note: i think ONE_MONTH_ACCOUNT, THREE_MONTH_ACCOUNT, SIX_MONTH_ACCOUNT are meaning
  // the account lifetime while the CapitalizationFrequency means the interests recieving frequency =>
  // => Should not be possible recieving an interest for a one month account in the second month, etc
  private getAccountLifetimeInNumbers(lifetime: InterestRate): number {
    switch (lifetime) {
      case InterestRate.ONE_MONTH_ACCOUNT:
        return 1;
      case InterestRate.THREE_MONTH_ACCOUNT:
        return 3;
      case InterestRate.SIX_MONTH_ACCOUNT:
        return 6;
      default:
        throw new Error('Invalid account interest rate. You cannot make a savings account for a long lifetime like that!');
    }
  }

  private addMonthlyInterest(savingAccount: SavingsAccountModel, currentInterestMonth: dayjs.Dayjs): void {
    const nextInterestDateForAccount = dayjs(savingAccount.lastInterestAppliedDate).add(1, 'months');

    const sameMonth = currentInterestMonth.isSame(nextInterestDateForAccount, 'month');
    const sameYear = currentInterestMonth.isSame(nextInterestDateForAccount, 'year');

    // until the lifetime of the savings account ends, clients will receive interest.
    // if it's equal, it means the lifetime ended for the account => no more interests
    if(this.getAccountLifetimeInNumbers(savingAccount.interest) > savingAccount.interestRecievedMonthCounter) {
      if (sameMonth && sameYear) {
        this.addInterest(savingAccount);
        savingAccount.interestRecievedMonthCounter += 1;
        savingAccount.lastInterestAppliedDate = currentInterestMonth.toDate();
      }
    }
  }

  private addQuarterlyInterest(savingAccount: SavingsAccountModel, currentInterestMonth: dayjs.Dayjs): void {
    const nextInterestDateForAccount = dayjs(savingAccount.lastInterestAppliedDate).add(3, 'months'); // Change to quarterly

    const sameQuarter = currentInterestMonth.isSame(nextInterestDateForAccount, 'month'); // Check if same quarter
    const sameYear = currentInterestMonth.isSame(nextInterestDateForAccount, 'year');

    // until the lifetime of the savings account ends, clients will receive interest
    // if it's equal, it means the lifetime ended for the account => no more interests
    if(this.getAccountLifetimeInNumbers(savingAccount.interest) > savingAccount.interestRecievedMonthCounter) {
      if (sameQuarter && sameYear) { // Check if same quarter and year
          this.addInterest(savingAccount);
          savingAccount.interestRecievedMonthCounter += 3;
          savingAccount.lastInterestAppliedDate = currentInterestMonth.toDate();
      }
    }
  }


  private addInterest(savingAccount: SavingsAccountModel): void {
    savingAccount.balance.amount += savingAccount.balance.amount * savingAccount.interest; // update balance with interest
  }
}

export const SavingsManagerServiceInstance = new SavingsManagerService();
