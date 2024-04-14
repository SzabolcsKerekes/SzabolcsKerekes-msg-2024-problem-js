import { checkingAccountA, checkingAccountB, checkingAccountC, checkingAccountD, checkingAccountE, savingsAccountA, savingsAccountB } from './seed/accounts.seed';
import { TransactionManagerServiceInstance } from './services/transaction-manager.service';
import { SavingsManagerServiceInstance } from './services/savings-manager.service';
import { seedInitializer } from './seed/seed-initializer';
import { MoneyModel } from './domain/money.model';
import { CurrencyType } from './domain/currency-type.enum';
import { getConversionRate } from './utils/money.utils';
import { InterestRate } from './domain/interest-rate.enum';

seedInitializer();

// ******************************************
// --------- CHECKING ACCOUNT TESTS ---------
// ******************************************
describe('\nChecking account tests:\n', () => {

  // --- TRANSFERING TESTS --- 
  describe('1. Transfering tests', () => {

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
  describe('2. Withdrawal tests', () => {
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
  describe('3. Currency converting tests', () => {
    // transfering EUR from RON to RON
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

    // transfering EUR from EUR to RON
    // transfering all the funds from C to A
    describe('Transfering EUR from EUR account to RON account', () => {
      test('Transfering 5EUR from CheckingAccountC to CheckingAccountA', () => {
        const transaction = TransactionManagerServiceInstance.transfer(
          checkingAccountC.id,
          checkingAccountA.id,
          new MoneyModel({ amount: 5, currency: CurrencyType.EUR })
        );
        // multiplying the amount by the exchange rate of EUR/RON to determine how much RON will be sent to the recipient's RON account.
        expect(transaction.amount.amount).toBe(5*getConversionRate(CurrencyType.EUR, CurrencyType.RON));
        expect(transaction.amount.currency).toBe(CurrencyType.RON); 
      });
      // Checking account C
      test('Expected money on checkingAccountC should be 0EUR', () => {
        expect(TransactionManagerServiceInstance.checkFunds(checkingAccountC.id).amount).toBe(0);
        expect(TransactionManagerServiceInstance.checkFunds(checkingAccountC.id).currency).toBe(CurrencyType.EUR);
      });
      // Checking account A
      test('Expected money on checkingAccountA should be 0.2RON+5EUR with the exchange rate of EUR/RON~=4.98 => 25.1RON', () => {
        expect(TransactionManagerServiceInstance.checkFunds(checkingAccountA.id).amount).toBe(25.1);
        expect(TransactionManagerServiceInstance.checkFunds(checkingAccountA.id).currency).toBe(CurrencyType.RON);
      });
    });

    // transfering EUR from RON to EUR
    describe('Transfering EUR from RON account to EUR account', () => {
      test('Transfering 5EUR from CheckingAccountA to CheckingAccountC', () => {
        const transaction = TransactionManagerServiceInstance.transfer(
          checkingAccountA.id,
          checkingAccountC.id,
          new MoneyModel({ amount: 5, currency: CurrencyType.EUR })
        );
        // multiplying the amount by the exchange rate of EUR/RON to determine how much RON will be sent to the recipient's RON account.
        expect(transaction.amount.amount).toBe(5);
        expect(transaction.amount.currency).toBe(CurrencyType.EUR); 
      });
      test('Expected money on checkingAccountA should be 25.1RON-5EUR = 0.2RON', () => {
        expect(TransactionManagerServiceInstance.checkFunds(checkingAccountA.id).amount).toBe(0.2);
        expect(TransactionManagerServiceInstance.checkFunds(checkingAccountA.id).currency).toBe(CurrencyType.RON);
      });
      test('Expected money on checkingAccountC should be 5 EUR', () => {
        expect(TransactionManagerServiceInstance.checkFunds(checkingAccountC.id).amount).toBe(5);
        expect(TransactionManagerServiceInstance.checkFunds(checkingAccountC.id).currency).toBe(CurrencyType.EUR);
      });
    });
  });
});


// ******************************************
// --------- SAVINGS ACCOUNT TESTS ---------
// ******************************************
describe('\nSavings account tests:\n', () => {
  describe('Checking SavingsAccountA and SavingsAccountB (Monthly and Quarterly interests) - Before interest', () => {
    test('Balance of savingsAccountA should be 1000 RON', () => {
      expect(TransactionManagerServiceInstance.checkFunds(savingsAccountA.id).amount).toBe(1000);
      expect(TransactionManagerServiceInstance.checkFunds(savingsAccountA.id).currency).toBe(CurrencyType.RON);
    });

    test('Balance of savingsAccountB should be 2000 EUR', () => {
      expect(TransactionManagerServiceInstance.checkFunds(savingsAccountB.id).amount).toBe(2000);
      expect(TransactionManagerServiceInstance.checkFunds(savingsAccountB.id).currency).toBe(CurrencyType.EUR);
    });
  });

  // one month later
  describe('1. Month - One month later the interests - Monthly interests only', () => {
    test('Time moved forward by one month', () => {
      SavingsManagerServiceInstance.passTime();
    });

    test('Balance of savingsAccountA should be 1055 RON', () => {
      expect(TransactionManagerServiceInstance.checkFunds(savingsAccountA.id).amount).toBe((1000*InterestRate.THREE_MONTH_ACCOUNT)+1000);
      expect(TransactionManagerServiceInstance.checkFunds(savingsAccountA.id).currency).toBe(CurrencyType.RON);
    });

    test('Balance of savingsAccountB should be 2000 EUR', () => {
      expect(TransactionManagerServiceInstance.checkFunds(savingsAccountB.id).amount).toBe(2000);
      expect(TransactionManagerServiceInstance.checkFunds(savingsAccountB.id).currency).toBe(CurrencyType.EUR);
    });
  });

  // one month later
  describe('2. Month - One month later the interests - Monthly interests only', () => {
    test('Time moved forward by one month', () => {
      SavingsManagerServiceInstance.passTime();
    });

    test('Balance of savingsAccountA should be 1113.025 RON', () => {
      expect(TransactionManagerServiceInstance.checkFunds(savingsAccountA.id).amount).toBe((1055*InterestRate.THREE_MONTH_ACCOUNT)+1055);
      expect(TransactionManagerServiceInstance.checkFunds(savingsAccountA.id).currency).toBe(CurrencyType.RON);
    });

    test('Balance of savingsAccountB should be 2000 EUR', () => {
      expect(TransactionManagerServiceInstance.checkFunds(savingsAccountB.id).amount).toBe(2000);
      expect(TransactionManagerServiceInstance.checkFunds(savingsAccountB.id).currency).toBe(CurrencyType.EUR);
    });
  });

  // one month later
  describe('3. Month - One month later the interests - Monthly and Quarterly interests', () => {
    test('Time moved forward by one month', () => {
      SavingsManagerServiceInstance.passTime();
    });

    test('Balance of savingsAccountA should be 1174.241375 RON', () => {
      expect(TransactionManagerServiceInstance.checkFunds(savingsAccountA.id).amount).toBe((1113.025*InterestRate.THREE_MONTH_ACCOUNT)+1113.025);
      expect(TransactionManagerServiceInstance.checkFunds(savingsAccountA.id).currency).toBe(CurrencyType.RON);
    });

    test('Balance of savingsAccountB should be 2113 EUR', () => {
      expect(TransactionManagerServiceInstance.checkFunds(savingsAccountB.id).amount).toBe((2000*InterestRate.SIX_MONTH_ACCOUNT)+2000);
      expect(TransactionManagerServiceInstance.checkFunds(savingsAccountB.id).currency).toBe(CurrencyType.EUR);
    });
  });
});


// ******************************************
// --------- EDGE CASES TESTS ---------
// ******************************************
describe('\nEdge cases tests:\n', () => {
  test('Transfering from Savings Account to Checking Account should not be allowed', () => {
    function throwError() {
      TransactionManagerServiceInstance.transfer(
        savingsAccountA.id,
        checkingAccountA.id,
        new MoneyModel({ amount: 5, currency: CurrencyType.EUR })
      );
    }
    expect(throwError).toThrow(Error);
    expect(throwError).toThrow('You cannot perform the transfer functionality between the following types of accounts: SAVINGS => CHECKING');
  });

  test('Transfering from Savings Account to Savings Account should not be allowed', () => {
    function throwError() {
      TransactionManagerServiceInstance.transfer(
        savingsAccountA.id,
        savingsAccountB.id,
        new MoneyModel({ amount: 5, currency: CurrencyType.EUR })
      );
    }
    expect(throwError).toThrow(Error);
    expect(throwError).toThrow('You cannot perform the transfer functionality between the following types of accounts: SAVINGS => SAVINGS');
  });

  test('Result of a transaction should not lead to negative account balance', () => {
    function throwError() {
      TransactionManagerServiceInstance.transfer(
        checkingAccountA.id,
        checkingAccountC.id,
        new MoneyModel({ amount: 5, currency: CurrencyType.RON })
      );
    }
    expect(throwError).toThrow(Error);
    expect(throwError).toThrow('Not enough funds available. Transfer is not allowed!');
  });

  test('Result of a withdrawal should not lead to negative account balance', () => {
    function throwError() {
      TransactionManagerServiceInstance.withdraw(
        checkingAccountA.id,
        new MoneyModel({ amount: 5, currency: CurrencyType.RON })
      );
    }
    expect(throwError).toThrow(Error);
    expect(throwError).toThrow('Not enough funds available. Withdrawal is not allowed!');
  });

  test('Transfering invalid currency type should not be allowed', () => {
    function throwError() {
      TransactionManagerServiceInstance.transfer(
        checkingAccountA.id,
        checkingAccountB.id,
        new MoneyModel({ amount: 5, currency: CurrencyType.USD })
      );
    }
    expect(throwError).toThrow(Error);
    expect(throwError).toThrow('Invalid currency type!');
  });

  test('Transfering to client\'s own account should not be possible', () => {
    function throwError() {
      TransactionManagerServiceInstance.transfer(
        checkingAccountA.id,
        checkingAccountA.id,
        new MoneyModel({ amount: 5, currency: CurrencyType.RON })
      );
    }
    expect(throwError).toThrow(Error);
    expect(throwError).toThrow('Transfer functionality from your own account to your same own account is not allowed!');
  });

  test('Transfering negative amount of money should not be possible', () => {
    function throwError() {
      TransactionManagerServiceInstance.transfer(
        checkingAccountA.id,
        checkingAccountB.id,
        new MoneyModel({ amount: -5, currency: CurrencyType.RON })
      );
    }
    expect(throwError).toThrow(Error);
    expect(throwError).toThrow('Transfering zero or negative amount is not allowed!');
  });

  test('Withdrawing negative amount of money should not be possible', () => {
    function throwError() {
      TransactionManagerServiceInstance.withdraw(
        checkingAccountA.id,
        new MoneyModel({ amount: -5, currency: CurrencyType.RON })
      );
    }
    expect(throwError).toThrow(Error);
    expect(throwError).toThrow('Withdrawing zero or negative amount is not allowed!');
  });

  test('Transfering nothing should not be possible', () => {
    function throwError() {
      TransactionManagerServiceInstance.transfer(
        checkingAccountA.id,
        checkingAccountB.id,
        new MoneyModel({ amount: 0, currency: CurrencyType.RON })
      );
    }
    expect(throwError).toThrow(Error);
    expect(throwError).toThrow('Transfering zero or negative amount is not allowed!');
  });

  test('Withdrawing nothing should not be possible', () => {
    function throwError() {
      TransactionManagerServiceInstance.withdraw(
        checkingAccountA.id,
        new MoneyModel({ amount: 0, currency: CurrencyType.RON })
      );
    }
    expect(throwError).toThrow(Error);
    expect(throwError).toThrow('Withdrawing zero or negative amount is not allowed!');
  });

  test('Transfering more than the balance should not be possible', () => {
    function throwError() {
      TransactionManagerServiceInstance.transfer(
        checkingAccountA.id,
        checkingAccountB.id,
        new MoneyModel({ amount: 1000, currency: CurrencyType.RON })
      );
    }
    expect(throwError).toThrow(Error);
    expect(throwError).toThrow('Not enough funds available. Transfer is not allowed!');
  });

  test('Withdrawing more than the balance should not be possible', () => {
    function throwError() {
      TransactionManagerServiceInstance.withdraw(
        checkingAccountA.id,
        new MoneyModel({ amount: 1000, currency: CurrencyType.RON })
      );
    }
    expect(throwError).toThrow(Error);
    expect(throwError).toThrow('Not enough funds available. Withdrawal is not allowed!');
  });

  test('Daily transfering amount of an account should not go above daily limit', async () => {
    function throwError() {
      TransactionManagerServiceInstance.transfer(
        checkingAccountD.id,
        checkingAccountB.id,
        new MoneyModel({ amount: 1000, currency: CurrencyType.EUR })
      );
    }
    expect(throwError).toThrow(Error);
    expect(throwError).toThrow('Daily trasfering limit reached. If you want to send more money, please update your plan!');
  });

  test('Daily withdrawal amount of an account should not go above daily limit', async () => {
    function throwError() {
      TransactionManagerServiceInstance.withdraw(
        checkingAccountD.id,
        new MoneyModel({ amount: 10000, currency: CurrencyType.EUR })
      );
    }
    expect(throwError).toThrow(Error);
    expect(throwError).toThrow('Daily withdrawal limit reached. If you want to withdraw more money, please update your plan!');
  });

  test('Transfering from account with expired card should not be allowed', async () => {
    function throwError() {
      TransactionManagerServiceInstance.transfer(
        checkingAccountE.id,
        checkingAccountA.id,
        new MoneyModel({ amount: 10, currency: CurrencyType.EUR })
      );
    }
    expect(throwError).toThrow(Error);
    expect(throwError).toThrow('Your bank card is expired or inactive. Try to activate it or get a new one from the bank!');
  });

  test('Withdrawal from account with inactive card should not be allowed', async () => {
    function throwError() {
      TransactionManagerServiceInstance.transfer(
        checkingAccountE.id,
        checkingAccountA.id,
        new MoneyModel({ amount: 10, currency: CurrencyType.EUR })
      );
    }
    expect(throwError).toThrow(Error);
    expect(throwError).toThrow('Your bank card is expired or inactive. Try to activate it or get a new one from the bank!');
  });
});