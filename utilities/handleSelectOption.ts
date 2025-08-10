import { Option } from "@/types/general";

export const handleSelectOption = <T extends Omit<Option, 'name'>>(
    id: string | number, 
    setOption: React.Dispatch<React.SetStateAction<T[]>>, 
    type: 'single' | 'multiple'
) => {
    if (type === 'single') {
        setOption((prevOptions) => {
            return prevOptions.map((option) => {
                if (option.id === id) {
                    return { ...option, isSelected: !option.isSelected };
                }
                return {
                    ...option,
                    isSelected: false,
                };
            }) as T[];
        })
    } else {
        setOption((prevOptions) => {
            const updatedOptions = prevOptions.map((option) => {
                if (option.id === id) {
                    return { ...option, isSelected: !option.isSelected };
                }
                return option;
            }) as T[];
            return updatedOptions;
        });
    }
}
