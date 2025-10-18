import { Router } from 'express';

const router = Router();

// 🎯 Rotas de contratos (implementar depois)
router.get('/', (req, res) => {
  res.json({ message: 'Contracts routes - TODO' });
});

export const contractRoutes = router;
