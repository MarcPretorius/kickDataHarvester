import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }: PaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    // Simple case: fewer pages than maximum to show
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
      return pageNumbers;
    }
    
    // Complex case: many pages, need to show ellipsis
    const leftSide = Math.floor(maxPagesToShow / 2);
    const rightSide = maxPagesToShow - leftSide - 1;
    
    // Special case: current page is close to beginning
    if (currentPage <= leftSide + 1) {
      for (let i = 1; i <= maxPagesToShow - 1; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push("ellipsis");
      pageNumbers.push(totalPages);
      return pageNumbers;
    }
    
    // Special case: current page is close to end
    if (currentPage >= totalPages - rightSide) {
      pageNumbers.push(1);
      pageNumbers.push("ellipsis");
      for (let i = totalPages - maxPagesToShow + 2; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
      return pageNumbers;
    }
    
    // Standard case: current page is somewhere in the middle
    pageNumbers.push(1);
    pageNumbers.push("ellipsis");
    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      pageNumbers.push(i);
    }
    pageNumbers.push("ellipsis");
    pageNumbers.push(totalPages);
    
    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <p className="text-sm text-neutral-300">
          Showing <span className="font-medium">{Math.min(itemsPerPage, totalItems)}</span> of{" "}
          <span className="font-medium">{totalItems}</span> entries
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
        >
          Previous
        </Button>
        
        {getPageNumbers().map((page, index) => (
          page === "ellipsis" ? (
            <Button
              key={`ellipsis-${index}`}
              variant="outline"
              size="sm"
              disabled
            >
              ...
            </Button>
          ) : (
            <Button
              key={index}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => typeof page === 'number' && onPageChange(page)}
            >
              {page}
            </Button>
          )
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
