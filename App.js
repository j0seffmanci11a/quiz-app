import React, { useState } from 'react';
import { Text, View, Button, FlatList, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ButtonGroup } from 'react-native-elements';

const Stack = createNativeStackNavigator();

// Sample questions
const questions = [
   {
    prompt: "What is the other two primary colours besides Yellow?.",
    type: "multiple-answer",
    choices: ["Green", "Red", "Blue", "White"],
    correct: [1, 2],
  },
  
  {
    prompt: "What is the capital of France?",
    type: "multiple-choice",
    choices: ["Paris", "London", "Rome", "Berlin"],
    correct: 0,
  },
 
  {
    prompt: "The earth is flat.",
    type: "true-false",
    choices: ["True", "False"],
    correct: 1,
  }
  // Correct Answers:
  // 1. 2 (0)
  // 2. Red and Blue ([1, 2])
  // 3. False (1)
];

// Question Component
export function Question({ route, navigation }) {
  const { data, index, answers } = route.params;
  const question = data[index];
  const [selectedIndex, setSelectedIndex] = useState(
    question.type === 'multiple-answer' ? [] : null
  );

  const toggleSelection = (i) => {
    if (question.type === 'multiple-answer') {
      setSelectedIndex((prev) =>
        prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
      );
    } else {
      setSelectedIndex(i);
    }
  };

  const isCorrect = () => {
    const correct = question.correct;
    if (Array.isArray(correct)) {
      return (
        Array.isArray(selectedIndex) &&
        correct.length === selectedIndex.length &&
        correct.every((val) => selectedIndex.includes(val))
      );
    }
    return selectedIndex === correct;
  };

  const handleNext = () => {
    const updatedAnswers = [
      ...answers,
      { selected: selectedIndex, correct: question.correct },
    ];
    if (index + 1 < data.length) {
      navigation.push('Question', {
        data,
        index: index + 1,
        answers: updatedAnswers,
      });
    } else {
      navigation.replace('Summary', {
        data,
        answers: updatedAnswers,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{question.prompt}</Text>
      <ButtonGroup
        testID="choices"
        buttons={question.choices}
        vertical
        onPress={toggleSelection}
        selectedIndexes={
          question.type === 'multiple-answer' ? selectedIndex : undefined
        }
        selectedIndex={
          question.type !== 'multiple-answer' ? selectedIndex : undefined
        }
      />
      <Button
        title="Next"
        testID="next-question"
        onPress={handleNext}
        disabled={
          selectedIndex === null ||
          (Array.isArray(selectedIndex) && selectedIndex.length === 0)
        }
      />
    </View>
  );
}

// Summary Component
export function Summary({ route }) {
  const { data, answers } = route.params;

  const getScore = () =>
    answers.reduce((score, answer, idx) => {
      const correct = data[idx].correct;
      const selected = answer.selected;
      if (Array.isArray(correct)) {
        return score +
          Array.isArray(selected) &&
          correct.length === selected.length &&
          correct.every((val) => selected.includes(val))
          ? 1
          : 0;
      } else {
        return selected === correct ? 1 : 0;
      }
    }, 0);

  const renderChoices = (q, selected, correct) => {
    return q.choices.map((choice, idx) => {
      const isSelected = Array.isArray(selected)
        ? selected.includes(idx)
        : selected === idx;
      const isCorrect = Array.isArray(correct)
        ? correct.includes(idx)
        : correct === idx;

      let style = {};
      if (isSelected && isCorrect) {
        style = styles.correctAnswer;
      } else if (isSelected && !isCorrect) {
        style = styles.incorrectAnswer;
      }

      return (
        <Text key={idx} style={style}>
          {choice}
        </Text>
      );
    });
  };

  return (
    <View style={styles.container}>
      <Text testID="total" style={styles.scoreText}>
        Score: {getScore()} / {data.length}
      </Text>
      <FlatList
        data={data}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.questionBlock}>
            <Text style={styles.prompt}>{item.prompt}</Text>
            {renderChoices(item, answers[index].selected, item.correct)}
          </View>
        )}
      />
    </View>
  );
}

// Main App Component
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Question">
        <Stack.Screen
          name="Question"
          component={Question}
          initialParams={{ data: questions, index: 0, answers: [] }}
        />
        <Stack.Screen name="Summary" component={Summary} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  prompt: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  correctAnswer: {
    fontWeight: 'bold',
    color: 'green',
  },
  incorrectAnswer: {
    textDecorationLine: 'line-through',
    color: 'red',
  },
  questionBlock: {
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 20,
    marginBottom: 16,
  },
});
