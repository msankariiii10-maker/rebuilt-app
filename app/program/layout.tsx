import './scene.css';
import SceneShell from '@/components/SceneShell';

export default function ProgramLayout({ children }: { children: React.ReactNode }) {
  return <SceneShell>{children}</SceneShell>;
}
