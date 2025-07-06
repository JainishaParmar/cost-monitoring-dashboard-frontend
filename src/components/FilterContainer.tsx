interface FilterContainerProps {
  children: React.ReactNode;
}

const FilterContainer = ({ children }: FilterContainerProps) => {
  return (
    <div className="common-filter-bar">
      {children}
    </div>
  );
};

export default FilterContainer;
 