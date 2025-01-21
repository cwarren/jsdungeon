function constrainValue(valToConstrain,min,max) {
    if (valToConstrain < min) { return min; }   
    if (valToConstrain > max) { return max; }
    return valToConstrain;  
}

export { constrainValue };