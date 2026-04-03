import { afterNextRender, Component, ElementRef, inject } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { History } from '../features/history/history';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [History],
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
    const aboutNextSection = this.el.nativeElement.querySelector('.about-me__next-section') as HTMLElement | null;
    const aboutNextSectionContent = this.el.nativeElement.querySelector('.about-me__next-section-content') as HTMLElement | null;
    const aboutNextSectionIcon = this.el.nativeElement.querySelector('.about-me__next-section-icon') as SVGElement | null;
    const aboutSubtextText = aboutSubtext?.querySelector('p') as HTMLParagraphElement | null;

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

    if (!heroSection || !aboutSection || !aboutHeader || !aboutSubtext || !aboutNextSection || !aboutNextSectionContent || !aboutNextSectionIcon || !aboutSubtextText) return;

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

    gsap.set(aboutSection, { yPercent: 100 });
    gsap.set(aboutSubtext, { autoAlpha: 0, y: 0 });
    gsap.set(aboutNextSection, { autoAlpha: 0, y: 24, scaleX: 1, scaleY: 1, borderRadius: '9999px' });
    gsap.set(aboutNextSectionContent, { autoAlpha: 0, y: 6 });
    gsap.set(aboutNextSectionIcon, { autoAlpha: 1 });
    gsap.set(aboutWords, { opacity: 0.2 });

    const master = gsap.timeline({ paused: true });
    const wordsFadeStart = 0.55;
    const wordsFadeDuration = 0.5;
    const wordsFadeEnd = wordsFadeStart + Math.max(0, aboutWords.length - 1) * 0.08 + wordsFadeDuration;
    const pillRevealStart = wordsFadeEnd + 0.25;
    const pillBounceStart = pillRevealStart + 0.55;
    const pillCenterStart = pillBounceStart + 0.45;
    const pillExpandStart = pillCenterStart + 0.7;

    master.fromTo(
      aboutSection,
      { yPercent: 100 },
      { yPercent: 0, ease: 'none' },
      0
    );

    master.to(
      aboutSubtext,
      { autoAlpha: 1, duration: 0.01, ease: 'none' },
      0.4
    );

    master.fromTo(
      aboutHeader,
      { y: 0, autoAlpha: 1 },
      { y: '-12vh', autoAlpha: 0, ease: 'power2.inOut' },
      pillRevealStart
    );

    master.fromTo(
      aboutWords,
      { opacity: 0.2 },
      { opacity: 1, stagger: 0.08, ease: 'none' },
      wordsFadeStart
    );

    master.to(
      aboutNextSection,
      { autoAlpha: 1, y: 0, duration: 0.55, ease: 'back.out(1.7)' },
      pillRevealStart
    );

    master.to(
      aboutNextSectionContent,
      { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      pillRevealStart + 0.1
    );

    master.to(
      aboutNextSection,
      { y: 18, duration: 0.55, ease: 'bounce.out' },
      pillBounceStart
    );

    master.to(
      aboutWords,
      {
        opacity: 0,
        y: (index) => (index % 2 === 0 ? -36 : 36),
        x: (index) => (index % 2 === 0 ? 18 : -18),
        rotation: (index) => (index % 2 === 0 ? -10 : 10),
        stagger: 0.04,
        ease: 'power2.in'
      },
      pillRevealStart + 0.1
    );

    master.call(() => {
      const pillRect = aboutNextSection.getBoundingClientRect();
      gsap.set(aboutNextSection, {
        position: 'fixed',
        top: pillRect.top,
        left: pillRect.left,
        width: pillRect.width,
        height: pillRect.height,
        margin: 0,
        x: 0,
        y: 0,
        xPercent: 0,
        yPercent: 0,
        zIndex: 40,
        transformOrigin: 'center center'
      });
    }, undefined, pillCenterStart);

    master.to(
      aboutNextSection,
      {
        top: '50%',
        left: '50%',
        xPercent: -50,
        yPercent: -50,
        y: 0,
        duration: 0.7,
        ease: 'power3.out'
      },
      pillCenterStart
    );

    master.to(
      aboutNextSection,
      {
        scaleX: Math.ceil(window.innerWidth / 320),
        scaleY: Math.ceil(window.innerHeight / 160),
        borderRadius: 0,
        duration: 0.95,
        ease: 'power2.inOut'
      },
      pillExpandStart
    );

    master.to(
      aboutNextSectionIcon,
      { autoAlpha: 0, duration: 0.2, ease: 'none' },
      pillExpandStart
    );

    ScrollTrigger.create({
      trigger: heroSection,
      start: 'top top',
      end: '+=480%',
      pin: true,
      scrub: 0.6,
      onUpdate: (self) => {
        master.progress(self.progress);
      }
    });
  });
}