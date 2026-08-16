const {queryFn} = require("../../utils/queryFunction");
const { comparePassword } = require("../../utils/bcryptHashing");
const generateToken = require("../../service/generateToken");
const tryCatchFunction = require("../../utils/tryCatchFunction");

const _loginUser = `
    SELECT 
        email,
        password,
        userid,
        firstname
    FROM 
        users 
    WHERE 
        email = $1`;

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return customResponse(res, 400, "All fields are required.", null, true);
    }

    const loginOperation = async (data) => {
        const user = await queryFn(_loginUser, [data.email]);

        if (!user.rows.length) {
            throw new Error("Invalid User ID or Password"); // Throw error for better handling
        }

        const isPasswordValid = await comparePassword(data.password, user.rows[0].password);

        if (!isPasswordValid) {
            throw new Error("Invalid User ID or password");
        }

        const token = generateToken(user.rows[0]);
        const payload = { email: user.rows[0].email, userid: user.rows[0].userid };
        return { user: payload, token };
    };

    return tryCatchFunction(loginOperation, res, "Login successful", "Something went wrong during login", { email, password });
};

module.exports = login;