import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: 'What is ARBIT?',
    answer: 'ARBIT is a trading card app that combines collectible cards with crypto trading education. Collect cards, learn trading concepts, and build your collection while mastering the fundamentals of cryptocurrency trading.',
  },
  {
    question: 'How do I collect cards?',
    answer: 'Cards can be collected through various methods including purchasing packs, trading with other users, or completing challenges. Browse the Gallery to see all available cards and check your Collection to view the cards you own.',
  },
  {
    question: 'What do the card stats mean?',
    answer: 'Each card has four stats:\n\n• Buy Up (Long Position): Represents a bullish position - buying when you expect prices to rise\n• Sell Down (Short Position): Represents a bearish position - selling when you expect prices to fall\n• Risk Power (Leverage): Shows how much risk/reward potential the card has\n• Market Smarts (Market IQ): Indicates the card\'s trading intelligence and market knowledge',
  },
  {
    question: 'What are card rarities?',
    answer: 'Cards come in four rarity levels:\n\n• Common: Most frequently found cards\n• Rare: Less common, more valuable\n• Epic: Hard to find, high value\n• Legendary: Extremely rare and powerful cards',
  },
  {
    question: 'What are factions?',
    answer: 'Factions are groups that cards belong to, each representing different trading strategies or market philosophies:\n\n• Nexus: Balanced, strategic traders\n• Void: High-risk, high-reward specialists\n• Flux: Adaptive, market-responsive traders',
  },
  {
    question: 'How do I trade cards?',
    answer: 'To trade a card, navigate to your Collection, select a card you want to trade, and tap the "Trade Card" button. You can then search for cards you want or browse available trades from other users.',
  },
  {
    question: 'What is a Long Position (Buy Up)?',
    answer: 'A long position means you buy an asset expecting its price to increase. If the price goes up, you profit. It\'s called "going long" because you\'re betting on upward price movement.',
  },
  {
    question: 'What is a Short Position (Sell Down)?',
    answer: 'A short position means you sell an asset you don\'t own, expecting its price to fall. If the price drops, you buy it back at a lower price and profit from the difference. It\'s "going short" because you\'re betting on downward price movement.',
  },
  {
    question: 'What is Leverage (Risk Power)?',
    answer: 'Leverage allows you to control a larger position with less capital. Higher leverage means higher potential profits but also higher risk of losses. Always use leverage carefully and understand the risks involved.',
  },
  {
    question: 'What is Market IQ (Market Smarts)?',
    answer: 'Market IQ represents your understanding of market trends, patterns, and trading strategies. Cards with higher Market IQ are better at reading market conditions and making informed trading decisions.',
  },
  {
    question: 'How do I increase my collection value?',
    answer: 'Your collection value increases by:\n\n• Collecting rarer cards (Epic and Legendary cards are worth more)\n• Completing sets or factions\n• Trading strategically to acquire valuable cards\n• Participating in special events and challenges',
  },
  {
    question: 'Can I see card details before trading?',
    answer: 'Yes! Tap on any card in the Gallery or Collection to view its full details, including all stats, description, rarity, and faction information. This helps you make informed trading decisions.',
  },
];

const HelpScreen: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0a0a0f', '#1a1a2e', '#16213e']}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Help & FAQ</Text>
            <Text style={styles.headerSubtitle}>
              Everything you need to know about ARBIT
            </Text>
          </View>

          {/* FAQs */}
          <View style={styles.faqContainer}>
            {faqs.map((faq, index) => (
              <View key={index} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFAQ(index)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  <Text style={styles.expandIcon}>
                    {expandedIndex === index ? '−' : '+'}
                  </Text>
                </TouchableOpacity>
                {expandedIndex === index && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Still have questions? Contact support for more help.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Extra padding for tab bar
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
  },
  faqContainer: {
    width: '100%',
  },
  faqItem: {
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginRight: 12,
  },
  expandIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8b5cf6',
    width: 24,
    textAlign: 'center',
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 22,
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
  },
});

export default HelpScreen;
