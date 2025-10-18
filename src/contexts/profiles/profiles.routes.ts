import { Router } from 'express';

const router = Router();

// 🎯 Rotas de contratos (implementar depois)
router.get('/', (req, res) => {
  res.json({ message: 'profileRoutes routes - TODO' });
});

export const profileRoutes = router;
