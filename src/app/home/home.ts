import { afterNextRender, Component, ElementRef, inject } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.scss'
})

export class HomeComponent {
  private readonly el = inject(ElementRef<HTMLElement>);

  private readonly setup = afterNextRender(() => {
  const heroSection = this.el.nativeElement.querySelector('.home__hero') as HTMLElement | null;
  const subtext = this.el.nativeElement.querySelector('.home__hero-subtext') as HTMLElement | null;
  const aboutSection = this.el.nativeElement.querySelector('.about-me') as HTMLElement | null;

  if (!subtext || !heroSection || !aboutSection) return;

  gsap.registerPlugin(ScrollTrigger);

  // --- Typewriter animation (unchanged) ---
  const text = subtext.textContent?.trim() ?? '';
  subtext.textContent = '';
  const fragment = document.createDocumentFragment();
  for (const character of text) {
    const span = document.createElement('span');
    span.className = 'home__hero-subtext-char';
    span.textContent = character === ' ' ? '\u00A0' : character;
    fragment.appendChild(span);
  }
  subtext.appendChild(fragment);
  const cursor = document.createElement('span');
  cursor.className = 'home__hero-subtext-cursor';
  subtext.appendChild(cursor);
  const characters = subtext.querySelectorAll('.home__hero-subtext-char') as NodeListOf<HTMLElement>;
  gsap.set(characters, { opacity: 0, y: 10 });
  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  tl.to(characters, { opacity: 1, y: 0, duration: 0.01, stagger: 0.045, repeatDelay: 2, repeat: -1, yoyo: true }, 0);
  tl.to(cursor, { opacity: 0, duration: 0.5, repeat: -1, yoyo: true }, 0);

  // --- Panel overlap scroll animation ---
  gsap.set(aboutSection, { yPercent: 100 });

  ScrollTrigger.create({
    trigger: heroSection,
    start: 'top top',
    end: '+=100%',          // scroll distance = one viewport height
    pin: true,              // pins the hero in place
    pinSpacing: true,       // pushes content below down (makes room for the scroll)
    onUpdate: (self) => {
      gsap.set(aboutSection, { yPercent: 100 - self.progress * 100 });
    }
  });
});
}