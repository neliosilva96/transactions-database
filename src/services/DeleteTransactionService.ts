import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';


class DeleteTransactionService {
  	public async execute(id : string): Promise<void> {
		const appointmentsRepository = getCustomRepository(TransactionsRepository);
		const item = await appointmentsRepository.findOne(id);

		if(!item)
			throw new AppError("Transaction does not exist");
		await appointmentsRepository.remove(item);
  	}
}

export default DeleteTransactionService;
