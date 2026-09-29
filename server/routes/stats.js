// server/routes/stats.js
import express from 'express';
import { db } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/stats (Protected)
router.get('/', authenticateToken, (req, res) => {
  try {
    const totalProjects = db.prepare('SELECT COUNT(*) as count FROM projects').get()?.count || 0;
    const visibleProjects = db.prepare('SELECT COUNT(*) as count FROM projects WHERE is_visible = 1').get()?.count || 0;
    const hiddenProjects = totalProjects - visibleProjects;

    const totalExperience = db.prepare('SELECT COUNT(*) as count FROM experiences').get()?.count || 0;
    const visibleExperience = db.prepare('SELECT COUNT(*) as count FROM experiences WHERE is_visible = 1').get()?.count || 0;

    const totalTools = db.prepare('SELECT COUNT(*) as count FROM tools').get()?.count || 0;
    const visibleTools = db.prepare('SELECT COUNT(*) as count FROM tools WHERE is_visible = 1').get()?.count || 0;

    const totalSkills = db.prepare('SELECT COUNT(*) as count FROM skills').get()?.count || 0;

    const recentActivity = db.prepare('SELECT * FROM activity_logs ORDER BY id DESC LIMIT 10').all();

    return res.json({
      success: true,
      data: {
        projects: {
          total: totalProjects,
          visible: visibleProjects,
          hidden: hiddenProjects
        },
        experience: {
          total: totalExperience,
          visible: visibleExperience,
          hidden: totalExperience - visibleExperience
        },
        tools: {
          total: totalTools,
          visible: visibleTools,
          hidden: totalTools - visibleTools
        },
        skills: {
          total: totalSkills
        },
        recentActivity: recentActivity.map(act => ({
          id: act.id,
          action: act.action,
          details: act.details,
          timestamp: act.created_at
        }))
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ success: false, message: 'Failed to calculate stats' });
  }
});

export default router;
