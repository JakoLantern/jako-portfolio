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
  gsap.registerPlugin(ScrollTrigger);

  const heroSection = this.el.nativeElement.querySelector('.home__hero') as HTMLElement | null;
  const heroSubtext = this.el.nativeElement.querySelector('.home__hero-subtext') as HTMLElement | null;
  const aboutSection = this.el.nativeElement.querySelector('.about-me') as HTMLElement | null;
  const aboutHeader = this.el.nativeElement.querySelector('.about-me__header h2') as HTMLElement | null;
  const aboutSubtext = this.el.nativeElement.querySelector('.about-me__subtext') as HTMLElement | null;
  const aboutSubtextText = aboutSubtext?.querySelector('p') as HTMLParagraphElement | null;

  // --- Typewriter (unchanged) ---
  if (heroSubtext) {
    const text = heroSubtext.textContent?.trim() ?? '';
    heroSubtext.textContent = '';
    const fragment = document.createDocumentFragment();
    for (const character of text) {
      const span = document.createElement('span');
      span.className = 'home__hero-subtext-char';
      span.textContent = character === ' ' ? '\u00A0' : character;
      fragment.appendChild(span);
    }
    heroSubtext.appendChild(fragment);
    const cursor = document.createElement('span');
    cursor.className = 'home__hero-subtext-cursor';
    heroSubtext.appendChild(cursor);
    const characters = heroSubtext.querySelectorAll('.home__hero-subtext-char') as NodeListOf<HTMLElement>;
    gsap.set(characters, { opacity: 0, y: 10 });
    const heroTimeline = gsap.timeline({ defaults: { ease: 'none' } });
    heroTimeline.to(characters, { opacity: 1, y: 0, duration: 0.01, stagger: 0.045, repeatDelay: 2, repeat: -1, yoyo: true }, 0);
    heroTimeline.to(cursor, { opacity: 0, duration: 0.5, repeat: -1, yoyo: true }, 0);
  }

  if (!heroSection || !aboutSection || !aboutHeader || !aboutSubtext || !aboutSubtextText) return;

  // --- Build word spans ---
  const aboutText = aboutSubtextText.textContent?.trim() ?? '';
  aboutSubtextText.textContent = '';
  const wordFragment = document.createDocumentFragment();
  const aboutWords: HTMLElement[] = [];
  aboutText.split(/(\s+)/).forEach((part) => {
    if (!part) return;
    if (/^\s+$/.test(part)) {
      wordFragment.appendChild(document.createTextNode(part));
      return;
    }
    const wordSpan = document.createElement('span');
    wordSpan.className = 'about-me__word';
    wordSpan.textContent = part;
    wordFragment.appendChild(wordSpan);
    aboutWords.push(wordSpan);
  });
  aboutSubtextText.appendChild(wordFragment);

  // --- Initial states ---
  gsap.set(aboutSection, { yPercent: 100 });
  gsap.set(aboutSubtext, { autoAlpha: 0 });
  gsap.set(aboutWords, { opacity: 0.2 });

  // --- One master timeline driven by a single long pin ---
  // Progress 0→0.4  : about-me slides up from 100% to 0%
  // Progress 0.4→1  : header moves up + words fade in
  const master = gsap.timeline({ paused: true });

  // Phase 1: slide up
  master.fromTo(
    aboutSection,
    { yPercent: 100 },
    { yPercent: 0, ease: 'none' },
    0
  );

  // Phase 2: reveal subtext at the same moment phase 1 ends
  master.to(
    aboutSubtext,
    { autoAlpha: 1, duration: 0.01, ease: 'none' },
    0.4            // starts exactly when slide finishes
  );

  // Phase 2: header drifts up + changes color
  master.fromTo(
    aboutHeader,
    { y: 0, color: 'var(--color-dark-main)' },
    { y: '-18vh', color: 'var(--color-yellow-dark)', ease: 'none' },
    0.4
  );

  // Phase 2: words fade in with stagger
  master.fromTo(
    aboutWords,
    { opacity: 0.2 },
    { opacity: 1, stagger: 0.08, ease: 'none' },
    0.55           // slight offset after header starts moving
  );

  // Single ScrollTrigger drives the whole master timeline
  ScrollTrigger.create({
    trigger: heroSection,
    start: 'top top',
    end: '+=300%',      // total scroll distance: 3× viewport heights
    pin: true,
    pinSpacing: true,
    scrub: 0.6,         // small smoothing value (seconds) for buttery feel
    onUpdate: (self) => {
      master.progress(self.progress);
    }
  });
});
}