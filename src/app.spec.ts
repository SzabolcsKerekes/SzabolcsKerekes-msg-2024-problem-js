import { checkingAccountA, checkingAccountB, checkingAccountC, savingsAccountA, savingsAccountB } from './seed/accounts.seed';
import { TransactionManagerServiceInstance } from './services/transaction-manager.service';
import { SavingsManagerServiceInstance } from './services/savings-manager.service';
import { seedInitializer } from './seed/seed-initializer';
import { MoneyModel } from './domain/money.model';
import { CurrencyType } from './domain/currency-type.enum';
import { getConversionRate } from './utils/money.utils';

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
  });


  // --- WITHDRAWAL TESTS --- 
  describe('Withdrawal tests', () => {
    describe('Checking funds before withdrawal on C', () => {
      // Checking account C
      test('Expected money (amount and currency) on checkingAccountC should be 10EUR', () => {
        expect(TransactionManagerServiceInstance.checkFunds(checkingAccountC.id).amount).toBe(10);
        expect(TransactionManagerServiceInstance.checkFunds(checkingAccountC.id).currency).toBe(CurrencyType.EUR);
      });
    });

    describe('Withdrawal', () => {
      test('Withdrawing 5EUR from CheckingAccountC', () => {
        const withdrawal = TransactionManagerServiceInstance.withdraw(
          checkingAccountC.id,
          new MoneyModel({ amount: 5, currency: CurrencyType.EUR })
        );
        expect(withdrawal.amount.amount).toBe(5);
        expect(withdrawal.amount.currency).toBe(CurrencyType.EUR); 
      });
    });

    describe('Checking funds after withdrawal on C', () => {
      // Checking account C
      test('Expected money (amount and currency) on checkingAccountC should be 5EUR', () => {
        expect(TransactionManagerServiceInstance.checkFunds(checkingAccountC.id).amount).toBe(5);
        expect(TransactionManagerServiceInstance.checkFunds(checkingAccountC.id).currency).toBe(CurrencyType.EUR);
      });
    });
  });


  // --- CURRENCY CONVERTING TESTS --- 
  describe('Currency converting tests', () => {

    describe('Transfering EUR from RON account to RON account', () => {
      // Checking account C
      test('Transfering 10EUR from CheckingAccountB to CheckingAccountA', () => {
        const transaction = TransactionManagerServiceInstance.transfer(
          checkingAccountA.id,
          checkingAccountB.id,
          new MoneyModel({ amount: 10, currency: CurrencyType.EUR })
        );
        // multiplying the amount by the exchange rate of EUR/RON to determine how much RON will be sent to the recipient's RON account.
        expect(transaction.amount.amount).toBe(10*getConversionRate(CurrencyType.EUR, CurrencyType.RON));
        expect(transaction.amount.currency).toBe(CurrencyType.RON); 
      });
      test('Expected money on checkingAccountA should be 50RON-10EUR with the exchange rate of EUR/RON~=4.98 => 0.2RON', () => {
        expect(TransactionManagerServiceInstance.checkFunds(checkingAccountA.id).amount).toBe(0.2);
        expect(TransactionManagerServiceInstance.checkFunds(checkingAccountA.id).currency).toBe(CurrencyType.RON);
      });
      test('Expected money on checkingAccountB should be 350RON+10EUR with the exchange rate of EUR/RON~=4.98 => 399.8RON', () => {
        expect(TransactionManagerServiceInstance.checkFunds(checkingAccountB.id).amount).toBe(399.8);
        expect(TransactionManagerServiceInstance.checkFunds(checkingAccountB.id).currency).toBe(CurrencyType.RON);
      });
    });
  });
})


// ******************************************
// --------- SAVINGS ACCOUNT TESTS ---------
// ******************************************
// describe('Savings account tests', () => {})
