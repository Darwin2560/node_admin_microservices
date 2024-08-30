import * as express from 'express';
import { Request, Response } from 'express';
import * as cors from 'cors';
import { AppDataSource } from './db';
import * as amqp from 'amqplib/callback_api';
import { Product } from './entity/product';

require('dotenv').config();


AppDataSource.initialize().then(() => {
    const productsRespository = AppDataSource.getRepository(Product);
    amqp.connect(process.env.AMQP_URL, (err, conn) => {
        if(err){
            throw err;
        }
        
        conn.createChannel((err, channel) => {
            if(err){
                throw err;
            }

            const app = express();
            app.use(cors({
                origin: ['http://localhost:3000', 'http://localhost:8080', 'localhost:4200'],
            }));

            app.use(express.json());

            app.get('/api/products', async (req: Request, res: Response) => {
                const products = await productsRespository.find();
                // channel.sendToQueue('hello', Buffer.from('hello')); // Send a message to the queue 'hello' (event)
                res.json(products);
            });
            
            app.post('/api/products', async (req: Request, res: Response) => {
                const product = await productsRespository.create(req.body)
                const result = await productsRespository.save(product);
                channel.sendToQueue('product_created', Buffer.from(JSON.stringify(result)));
                return res.send(result);
            });

            app.get('/api/products/:id', async (req: Request, res: Response) => {
                const product = await productsRespository.findOne({where: { id: Number(req.params.id) }});
                return res.send(product);
            });

            app.put('/api/products/:id', async (req: Request, res: Response) => {
                const product = await productsRespository.findOne({ where: { id: Number(req.params.id) }});
                productsRespository.merge(product, req.body);
                const result = await productsRespository.save(product);
                channel.sendToQueue('product_updated', Buffer.from(JSON.stringify(result)));
                return res.send(result);
            });

            app.delete('/api/products/:id', async (req: Request, res: Response) => {
                const result = await productsRespository.delete(req.params.id);
                channel.sendToQueue('product_deleted', Buffer.from(req.params.id));
                return res.send(result);
            });

            app.post('/api/products/:id/like', async (req: Request, res: Response) => {
                const product = await productsRespository.findOne({ where: { id: Number(req.params.id) }});
                product.likes++;
                const result = await productsRespository.save(product);
                return res.send(result);
            });
            console.log('Server is running on port 8000');
            app.listen(8000);
            process.on('beforeExit', () => {
                console.log('Closing');
                conn.close();
            })
        })
    })
})
