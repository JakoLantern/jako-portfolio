import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly destroyRef = inject(DestroyRef);
  protected readonly title = signal('jakosalem-portfolio');
  protected readonly scrollProgress = signal(0);

  private readonly setup = afterNextRender(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

      this.scrollProgress.set(Math.min(1, Math.max(0, progress)));
    };

    const controller = new AbortController();

    window.addEventListener('scroll', updateProgress, { passive: true, signal: controller.signal });
    window.addEventListener('resize', updateProgress, { passive: true, signal: controller.signal });

    updateProgress();

    this.destroyRef.onDestroy(() => {
      controller.abort();
    });
  });
}
