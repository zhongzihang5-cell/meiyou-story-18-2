import { redirect } from 'next/navigation'

/** 原落地页（按住录制）已迁至会员首页与声音管理；统一入口为会员首页 */
export default function AIStoriesRedirectPage() {
  redirect('/ai-stories/home')
}
