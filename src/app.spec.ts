import { checkingAccountA, checkingAccountB, checkingAccountC, savingsAccountA, savingsAccountB } from './seed/accounts.seed';
import { TransactionManagerServiceInstance } from './services/transaction-manager.service';
import { SavingsManagerServiceInstance } from './services/savings-manager.service';
import { seedInitializer } from './seed/seed-initializer';
import { MoneyModel } from './domain/money.model';
import { CurrencyType } from './domain/currency-type.enum';

seedInitializer();

// ******************************************
// --------- CHECKING ACCOUNT TESTS ---------
// ******************************************
describe('Checking account tests', () => {

  // --- TRANSFERING TESTS --- 
  describe('Transfering tests', () => {

    describe('Checking funds before transfer on A and B', () => {
      // Checking account A
      test('Expected money (amount and currency) on checkingAccountA should be 100RON', () => {
        expect(TransactionManagerServiceInstance.checkFunds(checkingAccountA.id).amount).toBe(100);
        expect(TransactionManagerServiceInstance.checkFunds(checkingAccountA.id).currency).toBe(CurrencyType.RON);
      });

      // Checking account B
      test('Expected money (amount and currency) on checkingAccountB should be 300RON', () => {
        expect(TransactionManagerServiceInstance.checkFunds(checkingAccountB.id).amount).toBe(300);
        expect(TransactionManagerServiceInstance.checkFunds(checkingAccountB.id).currency).toBe(CurrencyType.RON);
      });
    });


    describe('Transfer', () => {
      // Transfering money from A to B (CHECKING TO CHECKING)
      test('Transfering 50RON from CheckingAccountA to CheckingAccountB', () => {
        const transaction = TransactionManagerServiceInstance.transfer(
          checkingAccountA.id,
          checkingAccountB.id,
          new MoneyModel({ amount: 50, currency: CurrencyType.RON })
        );

        expect(transaction.amount.amount).toBe(50);
        expect(transaction.amount.currency).toBe(CurrencyType.RON); 
      });
    });

    describe('Checking funds after transfer on A and B', () => {
      // Checking account A
      test('Expected money (amount and currency) on checkingAccountA should be 50RON', () => {
        expect(TransactionManagerServiceInstance.checkFunds(checkingAccountA.id).amount).toBe(50);
        expect(TransactionManagerServiceInstance.checkFunds(checkingAccountA.id).currency).toBe(CurrencyType.RON);
      });

      // Checking account B
      test('Expected money (amount and currency) on checkingAccountB should be 350RON', () => {
        expect(TransactionManagerServiceInstance.checkFunds(checkingAccountB.id).amount).toBe(350);
        expect(TransactionManagerServiceInstance.checkFunds(checkingAccountB.id).currency).toBe(CurrencyType.RON);
      });
    });
  })
})


// ******************************************
// --------- SAVINGS ACCOUNT TESTS ---------
// ******************************************
// describe('Savings account tests', () => {})
