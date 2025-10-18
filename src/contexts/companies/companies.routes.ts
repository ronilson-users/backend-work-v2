import { Router } from 'express';

const router = Router();

// 🎯 Rotas de contratos (implementar depois)
router.get('/', (req, res) => {
  res.json({ message: 'companyRoutes routes - TODO' });
});

export const companyRoutes = router;
