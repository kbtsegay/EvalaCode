export interface TestCase {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arguments: any[];
  output: string | object | number | boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatPythonValue = (val: any): string => {
  if (typeof val === "string") {
    // Handle boolean strings from Python LLM output
    if (val === "True" || val === "False") {
      return val;
    }
    // Check if string is a json-like string (list or dict)
    if (
      val.trim().startsWith("[") ||
      val.trim().startsWith("{") ||
      val.trim().startsWith("(")
    ) {
      return val;
    }
    // Check if string is already quoted (e.g. "hello" or 'hello')
    if (val.trim().startsWith('"') || val.trim().startsWith("'")) {
      return val;
    }
    // Check if string is a number. If so, return it as is (assuming it's a numeric literal)
    if (!isNaN(Number(val)) && val.trim() !== "") {
      return val;
    }
    return `"${val}"`;
  }
  if (typeof val === "boolean") {
    return val ? "True" : "False";
  }
  return JSON.stringify(val);
};

export const generateTestRunnerScript = (
  functionName: string,
  testCases: TestCase[],
) => {
  const testCasesList = testCases
    .map((tc) => {
      // Ensure arguments is an array, if not wrap it
      const args = Array.isArray(tc.arguments) ? tc.arguments : [tc.arguments];
      // Format each argument individually
      const formattedArgs = args
        .map((arg) => formatPythonValue(arg))
        .join(", ");
      return `{"args": [${formattedArgs}], "expected": ${formatPythonValue(tc.output)}}`;
    })
    .join(",\n    ");

  return `
import json

def run_tests():
    test_cases = [
        ${testCasesList}
    ]
    
    passed = 0
    total = len(test_cases)
    
    print(f"\\nRunning {total} test cases for function '${functionName}'...\\n")
    
    for i, tc in enumerate(test_cases):
        args = tc["args"]
        expected = tc["expected"]
        
        try:
            # Always unpack arguments since we structured them as a list
            actual = ${functionName}(*args)
                
            if actual == expected:
                print(f"✅ Test {i+1} Passed")
                passed += 1
            else:
                print(f"❌ Test {i+1} Failed")
                print(f"   Input:    {args}")
                print(f"   Expected: {expected}")
                print(f"   Got:      {actual}")
                
        except Exception as e:
            print(f"❌ Test {i+1} Error: {str(e)}")
            
    print(f"\\nTest Result: {passed}/{total} passed")

run_tests()
`;
};
