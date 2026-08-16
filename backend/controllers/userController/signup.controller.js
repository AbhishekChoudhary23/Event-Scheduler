const {queryFn} = require("../../utils/queryFunction");
const { passwordHash } = require('../../utils/bcryptHashing');
const { customResponse } = require("../../utils/customResponse");

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

const _getUserByEmail = `
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
            return customResponse(res, 401, "User already Exists with this email.", null, true);
        }

        const hashedPassword = await passwordHash(password);
        const values = [firstname, email, hashedPassword];

        const user = await queryFn(_signupUserQuery, values);
        const userDetails = await queryFn(_getUserByEmail, [email]);

        return customResponse(res, 201, "User created successfully", userDetails.rows[0]);
    } catch (error) {
        console.error("Error during signup:", error);
        return customResponse(res, 400, "SOMETHING WENT WRONG", null, true);
    }
};

module.exports = signup;