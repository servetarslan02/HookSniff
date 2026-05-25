'use client';

import { useTranslations } from 'next-intl';
import { PrefetchLink as Link } from '@/components/PrefetchLink';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { posts, authors, categoryGradients, getRelatedPosts, getAdjacentPosts, tokenizeCode } from '@/lib/blog/data';
import { sanitizeHighlightHtml } from '@/lib/sanitize';

export function BlogPostContent() { params }
