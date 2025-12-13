import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidBlockProps {
  chart: string;
}

const MermaidBlock: React.FC<MermaidBlockProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
    });

    const renderChart = async () => {
      if (!containerRef.current) return;
      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
      } catch (error) {
        console.error('Mermaid render error:', error);
        setSvg(`<pre class="text-red-500 p-2 text-sm bg-red-50 rounded">Failed to render diagram. Invalid Syntax.</pre>`);
      }
    };

    renderChart();
  }, [chart]);

  return (
    <div
      className="my-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto flex justify-center"
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default MermaidBlock;
