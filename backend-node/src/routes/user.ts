import { Router } from 'express';

const router = Router();

interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  profession?: string;
  interests?: string[];
  preferredLanguage?: string;
  responseStyle?: string;
  experienceLevel?: string;
}

const userProfiles = new Map<string, UserProfile>();

router.get('/profile/:userId', (req, res) => {
  const userId = req.params.userId;
  const profile = userProfiles.get(userId) || {};
  
  return res.json(profile);
});

router.get('/profile', (req, res) => {
  const profile = userProfiles.get('default') || {};
  
  return res.json(profile);
});

router.put('/profile/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    const profileData: UserProfile = req.body;

    const allowedFields = [
      'firstName', 'lastName', 'email', 'profession', 
      'interests', 'preferredLanguage', 'responseStyle', 'experienceLevel'
    ];

    const sanitizedProfile: UserProfile = {};
    
    for (const [key, value] of Object.entries(profileData)) {
      if (allowedFields.includes(key)) {
        sanitizedProfile[key as keyof UserProfile] = value;
      }
    }

    userProfiles.set(userId, { ...userProfiles.get(userId), ...sanitizedProfile });

    return res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      profile: userProfiles.get(userId)
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ 
      error: 'Failed to update profile' 
    });
  }
});

router.put('/profile', (req, res) => {
  try {
    const userId = 'default';
    const profileData: UserProfile = req.body;

    const allowedFields = [
      'firstName', 'lastName', 'email', 'profession', 
      'interests', 'preferredLanguage', 'responseStyle', 'experienceLevel'
    ];

    const sanitizedProfile: UserProfile = {};
    
    for (const [key, value] of Object.entries(profileData)) {
      if (allowedFields.includes(key)) {
        sanitizedProfile[key as keyof UserProfile] = value;
      }
    }

    userProfiles.set(userId, { ...userProfiles.get(userId), ...sanitizedProfile });

    return res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      profile: userProfiles.get(userId)
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ 
      error: 'Failed to update profile' 
    });
  }
});

router.post('/change-password', (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        error: 'New password must be at least 8 characters long' 
      });
    }

    return res.json({ 
      success: true, 
      message: 'Password changed successfully' 
    });

  } catch (error) {
    console.error('Password change error:', error);
    return res.status(500).json({ 
      error: 'Failed to change password' 
    });
  }
});

export { router as userRouter };