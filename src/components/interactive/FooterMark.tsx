import { SignatureMark } from './SignatureMark';
import { useSound } from '@/hooks/useSound';

/**
 * Wrapper for SignatureMark in footer that uses global sound state
 */
export function FooterMark() {
    const { enabled: soundOn, toggle: toggleSound } = useSound();

    return (
        <SignatureMark
            soundOn={soundOn}
            onToggleSound={toggleSound}
        />
    );
}
