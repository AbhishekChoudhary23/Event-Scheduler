const queryFn = require("../../utils/queryFunction");
const { comparePassword } = require("../../utils/bcryptHashing");
const generateToken = require("../../service/generateToken");
const { customResponse } = require("../../utils/customResponse");
const CustomError = require("../../utils/CustomError");

const _loginUser = `
    SELECT 
        email,
        password,
        userid
    FROM 
        users 
    WHERE 
        email = $1`;


const login = async(req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new CustomError([{ message: "All fields are required." }], 400);
    }

    try {
        const user = await queryFn(_loginUser, [email]);
        if (user.rows.length === 0) {
            throw new CustomError([{ message: "Invalid User ID or Password" }], 401);
        }

        const isPasswordValid = await comparePassword(password, user.rows[0].password);
        if (!isPasswordValid) {
            throw new CustomError([{ message: "Invalid User ID or password" }], 401);
        }

        // Use the generateToken function to create a token
        const token = generateToken(user.rows[0]);
        const payload = { email: user.rows[0].email, userid: user.rows[0].userid };
        return customResponse(res, 200, "Login successful", { user: payload, token });
    } catch (error) {
        if (error instanceof CustomError) {
            return customResponse(res, error.status, error.message, null, true);
        }
        console.error("Error during login:", error);
        return customResponse(res, 400, "SOMETHING WENT WRONG", null, true);
    }
};

module.exports = login;