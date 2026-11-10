import { useState } from 'react';

export default function useSkyWriting() {
  const [writing, setWriting] = useState(false);
  const [text, setText] = useState('AN YÊN 2027');
  return { writing, setWriting, text, setText };
}
