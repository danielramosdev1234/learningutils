import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';

const PADDING = 16;

const getViewportDimensions = () => {
  if (typeof window === 'undefined') {
    return { width: 1280, height: 720 };
  }

  return { width: window.innerWidth, height: window.innerHeight };
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const createOverlaySegments = (rect) => {
  if (!rect) {
    return null;
  }

  const { width: viewportWidth, height: viewportHeight } = getViewportDimensions();
  const expanded = {
    top: Math.max(rect.top - PADDING, 0),
    left: Math.max(rect.left - PADDING, 0),
    width: Math.min(rect.width + PADDING * 2, viewportWidth),
    height: Math.min(rect.height + PADDING * 2, viewportHeight)
  };

  return {
    top: {
      top: 0,
      left: 0,
      width: viewportWidth,
      height: expanded.top
    },
    bottom: {
      top: expanded.top + expanded.height,
      left: 0,
      width: viewportWidth,
      height: Math.max(viewportHeight - (expanded.top + expanded.height), 0)
    },
    left: {
      top: expanded.top,
      left: 0,
      width: expanded.left,
      height: expanded.height
    },
    right: {
      top: expanded.top,
      left: expanded.left + expanded.width,
      width: Math.max(viewportWidth - (expanded.left + expanded.width), 0),
      height: expanded.height
    },
    highlight: {
      top: expanded.top,
      left: expanded.left,
      width: expanded.width,
      height: expanded.height
    }
  };
};

const computeTooltipPosition = (rect) => {
  const { width: viewportWidth, height: viewportHeight } = getViewportDimensions();
  const defaultWidth = 360;
  const estimatedHeight = 260;
  const gap = 24;

  if (!rect) {
    return {
      top: clamp(viewportHeight * 0.65, 80, viewportHeight - 260),
      left: (viewportWidth - defaultWidth) / 2,
      width: defaultWidth
    };
  }

  const horizontalPadding = 24;
  const tentativeLeft = rect.left + rect.width / 2 - defaultWidth / 2;
  const left = clamp(tentativeLeft, horizontalPadding, viewportWidth - defaultWidth - horizontalPadding);

  const belowTop = rect.bottom + PADDING + gap;
  const aboveTop = rect.top - PADDING - estimatedHeight - gap;
  const fitsBelow = belowTop + estimatedHeight < viewportHeight;
  const top = fitsBelow
    ? belowTop
    : clamp(aboveTop, 40, viewportHeight - estimatedHeight - 40);

  return {
    top,
    left,
    width: defaultWidth
  };
};

const GuidedTourOverlay = ({
  visible,
  steps,
  currentStep,
  onNext,
  onPrev,
  onSkip,
  onFinish,
  isNextDisabled = false
}) => {
  const step = steps?.[currentStep];
  const totalSteps = steps?.length || 0;
  const [targetRect, setTargetRect] = useState(null);
  const [segments, setSegments] = useState(null);

  const progressText = useMemo(() => {
    if (!visible || totalSteps === 0) return '';
    return `${currentStep + 1}/${totalSteps}`;
  }, [visible, totalSteps, currentStep]);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const primaryLabel = useMemo(() => {
    if (step?.primaryLabel) {
      return step.primaryLabel;
    }
    if (isFirstStep) return 'Começar';
    if (isLastStep) {
      return isNextDisabled ? 'Próximo' : 'Concluir';
    }
    return 'Próximo';
  }, [step, isFirstStep, isLastStep, isNextDisabled]);

  const updateRect = () => {
    if (!visible || !step?.targetId) {
      setTargetRect(null);
      setSegments(null);
      return;
    }

    const node = document.querySelector(`[data-tour-id="${step.targetId}"]`);
    if (!node) {
      setTargetRect(null);
      setSegments(null);
      return;
    }

    const rect = node.getBoundingClientRect();
    setTargetRect(rect);
    setSegments(createOverlaySegments(rect));
  };

  useLayoutEffect(() => {
    if (!visible) return;
    if (typeof window === 'undefined') return;

    if (step?.targetId) {
      const node = document.querySelector(`[data-tour-id="${step.targetId}"]`);
      if (node) {
        node.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    }

    updateRect();

    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, step?.targetId, currentStep]);

  useEffect(() => {
    if (!visible) {
      setTargetRect(null);
      setSegments(null);
    }
  }, [visible]);

  if (!visible || !step) {
    return null;
  }

  const tooltipPosition = computeTooltipPosition(targetRect);

  const handlePrimaryAction = () => {
    if (isLastStep && !isNextDisabled) {
      onFinish?.();
      return;
    }

    if (!isLastStep) {
      onNext?.();
    }
  };

  return (
    <div className="fixed inset-0 z-[998] pointer-events-none">
      <div className="absolute inset-0">
        {segments ? (
          <>
            <div
              className="absolute bg-slate-900/70 pointer-events-none"
              style={segments.top}
            />
            <div
              className="absolute bg-slate-900/70 pointer-events-none"
              style={segments.bottom}
            />
            <div
              className="absolute bg-slate-900/70 pointer-events-none"
              style={segments.left}
            />
            <div
              className="absolute bg-slate-900/70 pointer-events-none"
              style={segments.right}
            />
            <div
              className="absolute border-2 border-purple-400 rounded-2xl shadow-[0_0_0_9999px_rgba(15,23,42,0.4)] pointer-events-none transition-all duration-200 ease-out"
              style={segments.highlight}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-slate-900/70 pointer-events-none" />
        )}
      </div>

      <div
        className="absolute bg-white rounded-2xl shadow-2xl p-6 border border-purple-100 transition-all pointer-events-auto"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          width: tooltipPosition.width
        }}
      >
        <div className="flex items-center justify-between text-xs font-semibold text-purple-600 uppercase tracking-wider mb-4">
          <span>Tour Guiado</span>
          <span>{progressText}</span>
          <button
                      onClick={onSkip}
                      className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Pular tour
                    </button>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
        <p className="text-gray-600 leading-relaxed mb-6">{step.description}</p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <span
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentStep ? 'bg-purple-600 scale-110' : 'bg-purple-200'
                }`}
              />
            ))}
          </div>


        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onPrev}
            disabled={isFirstStep}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
              isFirstStep
                ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                : 'text-gray-600 border-gray-300 hover:bg-gray-100'
            }`}
          >
            Anterior
          </button>

          <button
            onClick={handlePrimaryAction}
          disabled={isLastStep && isNextDisabled}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-transform shadow-lg ${
              (isLastStep && isNextDisabled)
                ? 'bg-purple-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:-translate-y-0.5'
            }`}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuidedTourOverlay;

