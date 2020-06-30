import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {	title: string;	value: number; type: 'income' | 'outcome'; category: string;}
class CreateTransactionService {
	public async execute({ title, value, type, category, }: Request): Promise<Transaction> {
		const appointmentsRepository = getCustomRepository(TransactionsRepository);
		if (!['income', 'outcome'].includes(type))
			throw new AppError('transaction type is invalid');

		const {total} = await appointmentsRepository.getBalance();

		if ( type === "outcome" && value > total)
			throw new AppError("transaction without a valid balance");

		const catRepository = getRepository(Category);
		let catid = await catRepository.findOne( { where: { title : category } } );

		if(!catid)
		{
			catid = catRepository.create({title: category });
			await catRepository.save(catid);
		}

		const appointment = appointmentsRepository.create({ title, type, value, category : catid });
		await appointmentsRepository.save(appointment);
    	return appointment;
  	}
}

export default CreateTransactionService;
