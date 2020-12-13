var debtCalculator = require("./debt_calculator");
var knex = require("./db");

var budgetCalculator = {};

function doubleFactorial(n){
    var retval;
    if(n < 2){
        retval = 1;
    }
    else{
        retval =  n * doubleFactorial(n - 2);
    }
    return retval;
}

function factorial(n){
    if(n < 2){
        return 1;
    }
    else{
        return n * factorial(n - 1);
    }
}

function pochhammer(q, n){
    var m;
    var retval = 1;
    for(m = 0; m < n; m++){
        retval = retval * (q + m);
    }
    return retval;
}

function hypergeom(a, b, c, z){
    var n;
    var sum = 0;
    for(n = 0; n < 60; n++){
        sum += (pochhammer(a, n) * pochhammer(b, n) / (pochhammer(c, n) * factorial(n)) )* (z ** n) ;
        console.log(sum); // eslint-disable-line no-console
    }
    return sum;
}

function gamma(n){
    var retval;
    if(Math.abs(n - Math.round(n)) < 0.01){
        retval =  factorial(n - 1);
    }
    else{
        var m = Math.round(n * 2);
        retval =  Math.sqrt(Math.PI)*doubleFactorial(m - 2)/(2**((m-1)/2));
    }
    return retval;
}

budgetCalculator.tDistCDF = function tDistCDF(t, v){
    var cp;
    if(t < 0){
        cp = 1 - budgetCalculator.tDistCDF(-1*t, v);
    }
    else if (v == 1){
        cp = 1/2 + 1/Math.PI*Math.atan(t);
    }
    else if (v == 2){
        cp = 1/2 + t/(2*Math.sqrt(2)*Math.sqrt(1 + t**2/2));
    }
    else if (v == 3){
        cp = 1/2 + 1/Math.PI*(t/(Math.sqrt(3)*(1+t**2/3)) + Math.atan(t/Math.sqrt(3)));
    }
    else if (v == 4){
        cp = 1 - (1/12) * t**2 / (1 + t**2 / 4);
        cp *= 3/8 * t / Math.sqrt(1 + t**2 / 4);
        cp += 1/2;
    }
    else if (v == 5){
        cp = 1 + 2 / (3*(1 + t**2 / 5));
        cp *= t / (Math.sqrt(5)*(1 + t**2 / 5));
        cp *= 1 / Math.PI;
        cp += 1/2;
    }
    else if (t**2 >= v){ // our hypergeom only works if this isn't the case
        if (t < 0){
            cp = 0.01;
        }
        else {
            cp = 0.99; // close enough approximation
        }
    }
    else {
        var F12 = hypergeom(1/2, 1/2*(v+1), 3/2, -1 * (t**2)/v);
        cp = 1/2 + t * gamma(1/2*(v + 1)) * F12 / (Math.sqrt(v * 3.1415926) * gamma(v/2));

    }
    return cp;    
};


budgetCalculator.budgetPredictionFromList = function budgetPredictionFromList(purchases, limit){
    var probability;
    var purchase;
    var sum = 0;
    var max = 0;
    var validPurchasesCount = 0;

    for(purchase of purchases){
        if (purchase != null && purchase > 0){
            validPurchasesCount += 1;
            sum += purchase;
        }
        if (purchase > max){
            max = purchase;
        }
    }

    if(validPurchasesCount < 2){
        if (validPurchasesCount === 0){
            return {
                "budget": limit,
                "likelihood": 0,
                "meanPurchase": 0,
                "numberOfPurchases": 0,
                "mostExpensivePurchase": 0,
                "monthlySpending": 0
              };
        }
        else{
            if(purchases[0] > limit){
                probability = 1;
            }
            else if(purchases[0] === limit){
                probability = 0.5;
            }
            else{
                probability = 0;
            }
            return  {
                "budget": limit,
                "likelihood": probability,
                "meanPurchase": purchases[0],
                "numberOfPurchases": purchases.length,
                "mostExpensivePurchase": purchases[0],
                "monthlySpending": purchases[0]
              };
        }
    }

    var mean = sum/validPurchasesCount;
    var sumSq = 0;

    for(purchase of purchases){
        if (purchase != null && purchase > 0){
            sumSq  += (purchase - mean) ** 2;
        }
    }

    var perPurchase = limit/validPurchasesCount;

    var variance = sumSq / (validPurchasesCount - 1);
    var sigma = Math.sqrt(variance);

    var testStatistic = (mean - perPurchase) * Math.sqrt(validPurchasesCount) / sigma;

    probability = budgetCalculator.tDistCDF(testStatistic, validPurchasesCount - 1);

    return {
        "budget": limit,
        "likelihood": probability,
        "meanPurchase": mean,
        "numberOfPurchases": validPurchasesCount,
        "mostExpensivePurchase": max,
        "monthlySpending": sum
      };
};


budgetCalculator.budgetPrediction = async function budgetPrediction(roommateId){
    var purchases = await debtCalculator.getTotalSpent(knex, roommateId);

    var budget = await knex.select("roommate_budget")
        .from("roommates")
        .where("roommate_id", roommateId);

    if (budget.length === 0) {
        return null;
    }

    var limit = budget[0]["roommate_budget"];

    console.log(purchases); // eslint-disable-line no-console

    return budgetCalculator.budgetPredictionFromList(purchases, limit);
};
module.exports = budgetCalculator;
