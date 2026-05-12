# 📋 Super Riasec: Roadmap & TODO

## ✅ Completed (Post-Audit)
- [x] **Privilege Escalation Protection**: Secured the signup trigger against role spoofing.
- [x] **Auth Deadlock Fix**: Implemented the "Finalizing account..." state in `AuthPage`.
- [x] **Case-Insensitive Onboarding**: Verified `LOWER()` email matching for student invites.
- [x] **Batch Processing**: Refactored Bulk Tools to use array upserts for 10x performance.
- [x] **Edge Function Auth**: Switched from public keys to user session JWTs for AI agents.
- [x] **Admin Deletion**: Added the `delete_user` RPC and full UI management suite.

## 🎯 Next Generation Features (Phase 4)
- [x] **O*NET Integration**: Connect RIASEC results to the live O*NET career database for real-world job mapping.
- [ ] **Counselor Notifications**: Implement real-time alerts when a student completes an assessment or flags a need for support.
- [ ] **Parent Insight Reports**: Automatically generate PDF summaries for parents with AI-suggested conversation starters.
- [ ] **Portfolio Builder**: Allow students to export their "Journey" (results + goals) into a professional PDF for university applications.

## 🛠️ Infrastructure & Maintenance
- [ ] **Type Generation**: Run `supabase gen types typescript` once the production schema is finalized to remove `any` casts.
- [ ] **Automated Backups**: Configure weekly automated snapshots of the production database.
- [ ] **Load Testing**: Simulate 1,000+ concurrent students taking assessments to verify Edge Function limits.

## 🎨 UI/UX Refinements
- [ ] **Dark Mode Audit**: Refine the contrast of the Radar Charts in dark mode for better accessibility.
- [ ] **Skeleton Loaders**: Add shimmer effects to the "My Journey" cards for a smoother initial load.

---
*Next Update Scheduled for Phase 4 Release.*
