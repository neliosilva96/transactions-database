import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
	const res = await this.find()
	const { income, outcome } = res.reduce((accumulator, transaction) =>{
		switch (transaction.type) {
			case "income":
				accumulator.income += Number(transaction.value);
			break;
			case "outcome":
				accumulator.outcome += Number(transaction.value);
			break;
		}
		return accumulator;
	},{
		outcome: 0,
		income : 0
	});
	const total = income - outcome;
	return { income, outcome, total };
  }
}

export default TransactionsRepository;
