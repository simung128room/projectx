import { Request, Response } from 'express';

export const getHealth = async (req: Request, res: Response) => {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'Unknown';
    let isBlocked = false;
    
    res.json({ 
      status: 'ok', 
      time: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development',
      clientIp: clientIp,
      blocked: isBlocked
    });
};
