import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const ProductSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	categories: [{ type: mongoose.Types.ObjectId, ref: "Category", required: true }],
});

const CategorySchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	products: [{ type: mongoose.Types.ObjectId, ref: "Product", required: true }],
});

const Product = mongoose.model("Product", ProductSchema);
const Category = mongoose.model("Category", CategorySchema);

app.post("/category", async (req, res) => {
	const category = new Category({
		name: req.body.name,
	});

	await category.save();

	res.status(201).send("category created!");
});

app.post("/product", async (req, res) => {
	const product = new Product({
		title: req.body.title,
		categories: req.body.categories,
	});

	for (const categoryId of req.body.categories) {
		const category = await Category.findById(categoryId);

		category.products.push(product._id);

		await category.save();
	}

	await product.save();

	res.status(201).send("product created!");
});

app.get("/products", async (req, res) => {
	const products = await Product.find().populate("categories");
	res.json(products);
});

app.get("/categories", async (req, res) => {
	const categories = await Category.find().populate("products");
	res.json(categories);
});

app.listen(port, async () => {
	await mongoose.connect(process.env.MONGO_URI || "");
	console.log("server started");
});
