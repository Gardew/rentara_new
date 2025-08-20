import bcrypt from 'bcryptjs';
import prisma from '../prisma.js';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';

dotenv.config();



export async function createRealtor(req, res) {
    const {email, password, first_name, last_name} = req.body;
    try {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await prisma.user.create({
            data: {
                email: email,
                password: hashedPassword,
                firstName: first_name,
                lastName: last_name,
                salt: salt,
                name: first_name + ' ' + last_name,
                realtor: {
                    create: {}
                },
                role: 'REALTOR',
            },
        });


        res.status(201).json({message: 'User created successfully', user: newUser});
    }
    catch (error) {
        if (error.code === 'P2002') {
            res.status(409).json({message: 'User with that email already exists'});
        }
        else {
            console.error('Signup error:', error)
            res.status(500).json({message: 'Something went wrong'});
        }
    }
}

export async function login(req, res) {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const secretKey = process.env.SECRET_KEY;
        const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
        const accessExp = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
        const refreshExp = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

        if (!secretKey || !refreshSecret) {
            console.error('Login error: Missing JWT secrets', {
                hasSecretKey: Boolean(secretKey),
                hasRefreshSecret: Boolean(refreshSecret)
            });
            return res.status(500).json({ message: 'Server misconfigured: missing JWT secrets' });
        }

        const accessToken = jwt.sign({ userId: user.id, email: user.email }, secretKey, { expiresIn: accessExp });
        const refreshToken = jwt.sign({ userId: user.id, email: user.email }, refreshSecret, { expiresIn: refreshExp });

        res.status(200).json({ message: "Login successful", accessToken: accessToken, refreshToken: refreshToken });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Error logging in" });
    }
}

export async function refresh(req, res) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(403).json({ message: "Refresh token is required" });
    }

    try {
        const secretKey = process.env.SECRET_KEY;
        const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
        const accessExp = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
        const refreshExp = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

        if (!secretKey || !refreshSecret) {
            console.error('Refresh error: Missing JWT secrets', {
                hasSecretKey: Boolean(secretKey),
                hasRefreshSecret: Boolean(refreshSecret)
            });
            return res.status(500).json({ message: 'Server misconfigured: missing JWT secrets' });
        }

        const payload = jwt.verify(refreshToken, refreshSecret);

        // Check if the user exists
        const user = await prisma.user.findUnique({
            where: {
                id: payload.userId,
            },
        });

        if (!user) {
            return res.status(401).json({ message: "Invalid user" });
        }

        // Generate new access token and refresh token
        const newAccessToken = jwt.sign({ userId: user.id, email: user.email }, secretKey, { expiresIn: accessExp });
        const newRefreshToken = jwt.sign({ userId: user.id, email: user.email }, refreshSecret, { expiresIn: refreshExp });

        res.status(200).json({ message: "Refresh successful", accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (error) {
        console.error('Refresh error:', error);
        res.status(500).json({ message: "Error refreshing token" });
    }
}


export function authenticateToken(req, res, next) {
    // Gather the jwt access token from the request header
    const authHeader = req.headers['authorization'];

    // eslint-disable-next-line no-undef
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Access token is required" });
    }

    try {
        // eslint-disable-next-line no-undef
        const payload = jwt.verify(token, process.env.SECRET_KEY);
        req.user = payload;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid token" });
    }
}

