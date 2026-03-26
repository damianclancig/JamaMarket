
import React from 'react';
import Image from 'next/image';
import { Bone, PawPrint, Heart } from 'lucide-react';

interface JamaTipsProps {
  text: string;
}

const icons: { [key: string]: React.ElementType } = {
    '*': Bone,
    '-': Heart,
    '+': PawPrint,
};

export default function JamaTips({ text }: JamaTipsProps) {
  if (!text) {
    return null;
  }

  const bulletPointRegex = /^(\s*)([*+-])\s*(.*)/;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentListItems: React.ReactNode[] = [];

  const flushList = () => {
    if (currentListItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="space-y-2 my-4">
          {currentListItems}
        </ul>
      );
      currentListItems = [];
    }
  };

  lines.forEach((line, index) => {
    const match = line.match(bulletPointRegex);

    if (match) {
      const symbol = match[2] as keyof typeof icons;
      const content = match[3];
      const IconComponent = icons[symbol] || Bone;

      currentListItems.push(
        <li key={index} className="flex items-start gap-3">
          <span className="flex-shrink-0 mt-1">
            <IconComponent className="h-4 w-4 text-primary" />
          </span>
          <span className="text-muted-foreground">{content}</span>
        </li>
      );
    } else {
      flushList();
      if (line.trim()) {
        elements.push(
          <p key={index} className="text-muted-foreground my-4">
            {line}
          </p>
        );
      }
    }
  });

  flushList();

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {elements}
    </div>
  );
}
