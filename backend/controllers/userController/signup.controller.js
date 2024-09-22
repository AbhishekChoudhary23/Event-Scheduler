const queryFn = require("../../utils/queryFunction");
const { passwordHash } = require('../../utils/bcryptHashing');
const generateToken = require("../../service/generateToken");
const { customResponse } = require("../../utils/customResponse");
const CustomError = require("../../utils/CustomError");

const existingUser = `
    SELECT 
        email 
    FROM 
        users 
    WHERE 
        email = $1;
`;

const _signupUserQuery = `
    INSERT INTO 
        users (firstname, email, password) 
    VALUES 
        ($1, $2, $3) 
     RETURNING *;
`;

const getUserByEmail = `
    SELECT 
        firstname, 
        email 
    FROM 
        users 
    WHERE 
        email = $1;
`;

const signup = async (req, res) => {
    const { firstname, email, password } = req.body;

    try {
        const checkExistingUser = await queryFn(existingUser, [email]);
        if (checkExistingUser.rows.length > 0) {
            throw new CustomError([{ message: "User already Exists with this email." }], 400);
        }

        const hashedPassword = await passwordHash(password);
        const values = [firstname, email, hashedPassword];

        const user = await queryFn(_signupUserQuery, values);

        return customResponse(res, 201, "User created successfully", user.rows[0]);
    } catch (error) {
        if (error instanceof CustomError) {
            return customResponse(res, error.status, error.message, null, true);
        }
        console.error("Error during signup:", error);
        return customResponse(res, 400, "SOMETHING WENT WRONG", null, true);
    }
};

module.exports = signup;