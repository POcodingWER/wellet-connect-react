//SPDX-License-Identifier: Unlicense

pragma solidity >= 0.5.0 < 0.9.0;
 
//import "hardhat/console.sol";

contract SimpleStorageUpgrade{
    uint storedData;
    
    event change(string message, uint newVal);
    
    function set(uint x) public {
        //console.log("the value is %d",x);
        require(x< 5000, "should be less than 5000");
        storedData = x ;
        emit change("set",x);
    }
    
    function get() public view returns(uint){
        return storedData;
    }


}
    
    
