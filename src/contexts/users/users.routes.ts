import { Router } from 'express';

const router = Router();

// 🎯 Rotas de contratos (implementar depois)
router.get('/', (req, res) => {
  res.json({ message: 'userRoutes routes - TODO' });
});

export const userRoutes = router;
