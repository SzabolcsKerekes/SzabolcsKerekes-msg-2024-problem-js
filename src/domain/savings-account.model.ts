import { AccountModel } from './account.model';
import { AccountType } from './account-type.enum';
import { CapitalizationFrequency } from './capitalization-frequency.enum';

export class SavingsAccountModel extends AccountModel {
  interest!: number; // always adds to balance based on frequency
  interestFrequency!: CapitalizationFrequency; // how often interest is added to the account balance
  lastInterestAppliedDate!: Date; // the last date the interest was applied to the account
  interestRecievedMonthCounter!:  number; // keeps track of how many times interest has been recieved for this account

  constructor(values: Omit<SavingsAccountModel, 'accountType'>) {
    super({
      id: values.id,
      accountType: AccountType.SAVINGS,
      balance: values.balance,
      transactions: values.transactions || [],
    });
    this.interest = values.interest;
    this.interestFrequency = values.interestFrequency;
    this.lastInterestAppliedDate = values.lastInterestAppliedDate;
    this.interestRecievedMonthCounter = values.interestRecievedMonthCounter;
  }
}
