import { sql } from "../config/db.js"; 

export const getProducts = async (req, res) => {
    try {
        const products = await sql`
            SELECT * FROM products
            ORDER BY created_at DESC     
`;
    console.log("fetched products", products) 
    res.status(200).json({
        success: true, 
        data: products
    }); 

    } catch (error) {
        console.log("Error in getProducts function", error);
        res.status(500).json({success: false, message:"Internal Server Error"});
    }
};

export const createProduct = async (req, res) => {
    const { name, price, image } = req.body;
    
    if (!name || !price || !image) {
        return res.status(400).json({success: false, message: "All fields are required"});
    }

    //write function to check to see if product exists 

    try {
        const newProduct = await sql`
            INSERT INTO products (name,image,price)
            VALUES (${name},${image},${price})
            RETURNING *
        `;
        //postman free
        res.status(201).json({success: true, data: newProduct[0]})


    } catch (error) {
        console.log("Error in creating product function", error);
        return res.status(500).json({success: false, message: "Internal Server Error"});
    }
};

export const getProduct = async (req, res) => {
    console.log("Hello")
    const { id } = req.params; 

    try {
        const product = await sql`
        SELECT * FROM products WHERE id=${id}`

    res.status(200).json({success: true, data: product[0], message: "Hello there is data"});

    //when checking the /5 resource e.g. id=5, it will still return status 200, this is because the sql query will return true regardless of there is no id in the DB, but if the number = the number input

    } catch (error) {
        console.log("Error in getProduct function", error);
        res.status(500).json({success: false, message:"Internal Server Error"}); 
    }
};

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, price, image } = req.body;

    try {
        const updatedProduct = await sql`
            UPDATE products
            SET name=${name}, price=${price}, image=${image}
            WHERE id=${id}
            RETURNING *
        `;

        if (updatedProduct === 0) {
            return res.status(404).json({sucess: false, message: "Product not found"})
        }

        res.status(200).json({success: true, data: updatedProduct[0]})

    } catch (error) {
        console.log("Error in updateProduct function", error);
        res.status(500).json({sucess: false, message: "Internal Server Error"});

    }
};

export const deleteProduct = async (req, res) => {
    console.log("Hello")
    const { id } = req.params; 
    try {
        const deletedProduct = await sql`
            DELETE FROM products WHERE id=${id} RETURNING * 
        `;

        if (deletedProduct.length === 0) {
            return res.status(404).json({success: false, message: "Product not found"});  
        }
        
        res.status(200).json({success: true, data: deletedProduct[0]});

    } catch (error) {
        console.log("Error in deleteProduct function", error);
        res.status(500).json({success: false, message: "Internal Server Error"});
    }
};
