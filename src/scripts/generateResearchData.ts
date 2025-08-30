// Script to generate AI research data for the database
// Run this once to populate high-quality research insights

import { inflectionAI } from '../lib/inflectionAI'
import { supabase } from '../lib/supabase'

async function generateAndStoreResearchData() {
  console.log('🧠 Generating AI research insights...')
  
  try {
    // Generate research insights using Inflection AI
    const researchInsights = await inflectionAI.generateResearchData()
    
    console.log(`✅ Generated ${researchInsights.length} research insights`)
    
    // Store in database
    const { data, error } = await supabase
      .from('ai_research_insights')
      .insert(
        researchInsights.map(insight => ({
          title: insight.title,
          summary: insight.summary,
          category: insight.category,
          impact_data: insight.impact_data,
          source_type: insight.source_type,
          credibility_score: insight.credibility_score,
          generated_by_ai: true,
          published: true,
          featured: insight.credibility_score >= 8 // Feature high-credibility insights
        }))
      )
    
    if (error) {
      console.error('❌ Error storing research data:', error)
      return
    }
    
    console.log('✅ Successfully stored research insights in database')
    
    // Display the generated insights
    console.log('\n📊 Generated Research Insights:')
    console.log('=' .repeat(80))
    
    researchInsights.forEach((insight, index) => {
      console.log(`\n${index + 1}. ${insight.title}`)
      console.log(`   Category: ${insight.category}`)
      console.log(`   Credibility: ${insight.credibility_score}/10`)
      console.log(`   Impact: ${insight.impact_data}`)
      console.log(`   Summary: ${insight.summary.substring(0, 150)}...`)
    })
    
    console.log('\n🎉 Research data generation completed successfully!')
    
  } catch (error) {
    console.error('❌ Error generating research data:', error)
  }
}

// Export for use in other scripts
export { generateAndStoreResearchData }

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAndStoreResearchData()
}
