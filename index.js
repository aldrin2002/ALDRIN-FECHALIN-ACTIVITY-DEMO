const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ✅ Create Account with Profile
async function createAccount(email, name) {
    try {
        const existingAccount = await prisma.account.findUnique({ where: { email } });
        if (existingAccount) {
            console.log("⚠ Account already exists:", existingAccount);
            return existingAccount;
        }

        const newAccount = await prisma.account.create({
            data: { email, profile: { create: { name } } },
            include: { profile: true }
        });

        console.log("✅ Created Account:", newAccount);
        return newAccount;
    } catch (error) {
        console.error("❌ Error creating account:", error);
    }
}

// ✅ Add Product to an Existing Account
async function addProduct(accountId, name, price) {
    try {
        const product = await prisma.product.create({
            data: { name, price, accountId }
        });
        console.log("✅ Added Product:", product);
    } catch (error) {
        console.error("❌ Error adding product:", error);
    }
}

// ✅ Fetch All Accounts with Profiles & Products
async function getAllData() {
    try {
        const accounts = await prisma.account.findMany({ include: { profile: true, products: true } });
        const products = await prisma.product.findMany();

        console.log("✅ Accounts:", JSON.stringify(accounts, null, 2));
        console.log("✅ Products:", JSON.stringify(products, null, 2));
    } catch (error) {
        console.error("❌ Error fetching data:", error);
    }
}

// ✅ Update Account & Profile
async function updateAccount(accountId, newEmail, newName) {
    try {
        // Check if the new email is already in use by another account
        const emailExists = await prisma.account.findUnique({ where: { email: newEmail } });

        if (emailExists && emailExists.id !== accountId) {
            console.log("⚠ Email is already taken by another account:", newEmail);
            return;
        }

        const updatedAccount = await prisma.account.update({
            where: { id: accountId },
            data: { email: newEmail, profile: { update: { name: newName } } },
            include: { profile: true }
        });

        console.log("✅ Updated Account:", updatedAccount);
    } catch (error) {
        console.error("❌ Error updating account:", error);
    }
}


// ✅ Update Product
async function updateProduct(productId, newName, newPrice) {
    try {
        const existingProduct = await prisma.product.findUnique({ where: { id: productId } });

        if (!existingProduct) {
            console.log(`⚠ Product with ID ${productId} not found.`);
            return;
        }

        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: { name: newName, price: newPrice }
        });

        console.log("✅ Updated Product:", updatedProduct);
    } catch (error) {
        console.error("❌ Error updating product:", error);
    }
}


// ✅ Delete Product
async function deleteProduct(productId) {
    try {
        const existingProduct = await prisma.product.findUnique({ where: { id: productId } });

        if (!existingProduct) {
            console.log(`⚠ Product with ID ${productId} does not exist.`);
            return;
        }

        await prisma.product.delete({ where: { id: productId } });
        console.log("✅ Product deleted successfully");
    } catch (error) {
        console.error("❌ Error deleting product:", error);
    }
}

// ✅ Delete Account (Automatically Deletes Profile & Products)
async function deleteAccount(accountId) {
    try {
        // Step 1: Delete all products linked to the account
        await prisma.product.deleteMany({
            where: { accountId: accountId }
        });

        // Step 2: Delete the profile linked to the account
        await prisma.profile.delete({
            where: { accountId: accountId }
        });

        // Step 3: Now delete the account
        await prisma.account.delete({
            where: { id: accountId }
        });

        console.log("✅ Account and all related data deleted successfully");
    } catch (error) {
        console.error("❌ Error deleting account:", error);
    }
}


// ✅ Run All Functions in Sequence
async function main() {
    const account = await createAccount("aldringalvante@gmail.com", "Aldrin Galvante");

    if (account) {
        await addProduct(account.id, "Kamote", 10);
        await addProduct(account.id, "Coffee Beans", 9.99);

        await updateAccount(account.id, "updatedemail@example.com", "Updated Name");
        await updateProduct(1, "Organic Coffee Beans", 14.99);

        await getAllData();

        await deleteProduct(1);
        await deleteAccount(account.id);
    }
}

// ✅ Run the Script
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
