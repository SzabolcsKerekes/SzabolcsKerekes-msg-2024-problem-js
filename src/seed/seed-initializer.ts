import { AccountsRepository } from '../repository/accounts.repository';
import {
  checkingAccountA,
  checkingAccountB,
  checkingAccountC,
  checkingAccountD,
  checkingAccountE,
  checkingAccountF,
  savingsAccountA,
  savingsAccountB,
  savingsAccountC,
} from './accounts.seed';

export function seedInitializer(): void {
  console.log('[Seeder]', '-------------Seeding data----------------\n');
  AccountsRepository.add(savingsAccountA.id, savingsAccountA);
  AccountsRepository.add(savingsAccountB.id, savingsAccountB);
  AccountsRepository.add(savingsAccountC.id, savingsAccountC);
  AccountsRepository.add(checkingAccountA.id, checkingAccountA);
  AccountsRepository.add(checkingAccountB.id, checkingAccountB);
  AccountsRepository.add(checkingAccountC.id, checkingAccountC);
  AccountsRepository.add(checkingAccountD.id, checkingAccountD);
  AccountsRepository.add(checkingAccountE.id, checkingAccountE);
  AccountsRepository.add(checkingAccountF.id, checkingAccountF);
}
