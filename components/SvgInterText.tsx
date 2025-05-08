import React, { FC, ReactNode } from 'react';
import Svg, { SvgProps, Text } from 'react-native-svg';
import { colors } from '../utilities/colors';
import { FontWeight } from '@/types/general';



interface SvgInterTextProps extends SvgProps {
    children?: ReactNode | undefined,
    fontSize?: number | undefined,
    color?: string | undefined,
    fontWeight?: FontWeight | undefined,
    width: number,
    height: number,
    textAlign?: 'left' | 'right' | undefined,
}

const SvgInterText: FC<SvgInterTextProps> = ({ 
    children,
    fontSize, 
    color,
    fontWeight, 
    width, 
    height,
    textAlign,
}) => {

    // Calculate x position based on alignment
    const getXPosition = () => {
        if (textAlign === 'left') return 0;          // Start from the left
        if (textAlign === 'right') return width;     // Start from the right edge
        return width / 2;                        // Default to center
    };

    const getFontFamily = () => {
        if (fontWeight && ["medium", "Medium", 500, "500"].includes(fontWeight)) return 'inter-medium';
        else if (fontWeight && ["semibold", "Semibold", 600, "600"].includes(fontWeight)) return 'inter-semibold';
        else if (fontWeight && ["bold", "Bold", 700, "700"].includes(fontWeight)) return 'inter-bold';
        else if (fontWeight && ["extrabold", "Extrabold", 800, "800"].includes(fontWeight)) return 'inter-extrabold';
        return 'inter-regular';
    };
    

    const getFontWeight = () => {
        if (fontWeight && ["medium", "Medium", 500, "500"].includes(fontWeight)) return '500';
        else if (fontWeight && ["semibold", "Semibold", 600, "600"].includes(fontWeight)) return '600';
        else if (fontWeight && ["bold", "Bold", 700, "700"].includes(fontWeight)) return '700';
        else if (fontWeight && ["extrabold", "Extrabold", 800, "800"].includes(fontWeight)) return '800';
        return '900';
    };

    return (
        <Svg
            width={width}  // Set width of SVG container
            height={height} // Set height of SVG container
            viewBox={`0 0 ${width} ${height}`}
            // fill={'red'}
        >
            
            <Text
                x={getXPosition()} 
                y="50%" 
                fontSize={fontSize || 14}
                fontFamily={getFontFamily()}
                fill={color ?? colors.black}
                textAnchor={(() => {
                    if (textAlign === 'left') return "start";          // Start from the left
                    if (textAlign === 'right') return "end";     // Start from the right edge
                    return "middle";   
                })()} // Adjust text anchor for left alignment
                alignmentBaseline="middle" 
                fontWeight={getFontWeight()}
            >
                {children}
            </Text>
        </Svg>
    );
};

export default SvgInterText;
