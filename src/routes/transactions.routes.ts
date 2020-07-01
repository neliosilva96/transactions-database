import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import uploadconfig from "../config/upload";
import multer from 'multer';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadconfig);

transactionsRouter.get('/', async (request, response) => {
	const appointmentsRepository =  getCustomRepository(TransactionsRepository);
	const transactions =  await appointmentsRepository.find();
	const balance = await appointmentsRepository.getBalance();
	return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const createAppointment = new CreateTransactionService();
  const appointment = await createAppointment.execute({ title, value, type, category });
  return response.json(appointment);
});

transactionsRouter.delete('/:id', async (request, response) => {
	const { id } = request.params;
	const deleteAppointment = new DeleteTransactionService();
	await deleteAppointment.execute(id);
	return response.status(204).send();
});

transactionsRouter.post('/import',  upload.single('file'),  async (request, response) => {
	// const service = new ImportTransactionsService();

	// const transactions = await service.execute(request.file.path);
	// return response.json(transactions);
});

export default transactionsRouter;
