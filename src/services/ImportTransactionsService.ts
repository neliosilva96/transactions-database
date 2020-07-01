import { getCustomRepository, In, Index, getRepository } from "typeorm";
import TransactionsRepository from "../repositories/TransactionsRepository";
import csvParse from "csv-parse";
import fs from "fs";
import Transaction from '../models/Transaction';
import Category from "../models/Category";


interface CSVTransation {
	title :string,
	type: "income" | "outcome",
	category : string,
	value: number
}
class ImportTransactionsService {
  	async execute(filepath : string): Promise<Transaction[]> {

		const catRepository = getRepository(Category);
		const transRepository = getCustomRepository(TransactionsRepository);

		const ReadStream = fs.createReadStream(filepath);
		const categories : string[] = [];
		const transactions : CSVTransation[]  = [];
		const parsers = csvParse({
			from_line : 2
		});
		const parsecsv = ReadStream.pipe(parsers);
		parsecsv.on("data", async line=> {
			const [title, type, value, category ] = line.map((cell: string) => cell.trim());

			if(!title || !type || !value) return;
			categories.push(category);
			transactions.push( {title, type, value, category});
		});

		await new Promise(resolve => parsecsv.on("end", resolve))

		const existentCategories = await catRepository.find( { where : { title: In(categories) }});
		const existentCategoriesTitle = existentCategories.map((categorie : Category)=> categorie.title);

		const addCategorieTitles = categories
		.filter(category => !existentCategoriesTitle.includes(category))
		.filter((value, index, self) =>  self.indexOf(value) == index );

		const newCategories = catRepository.create( addCategorieTitles.map(title=> ({
				title
			}))
		);
		await catRepository.save(newCategories);


		const finalCategories = [... newCategories, ... existentCategories ];

		const newtransactions = transRepository.create(
			transactions.map(transaction=> ({
				title : transaction.title,
				type : transaction.type,
				value : transaction.value,
				category : finalCategories.find(categorie => categorie.title == transaction.category)
			}))
		);

		await transRepository.save(newtransactions);
		await fs.promises.unlink(filepath);
		return newtransactions;
  	}
}

export default ImportTransactionsService;
