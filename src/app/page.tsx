'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Target, 
  BookOpen, 
  Dumbbell, 
  Trophy, 
  Star, 
  Plus, 
  Clock, 
  Zap,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Calendar,
  Award
} from 'lucide-react'

interface UserStats {
  level: number
  exp: number
  expToNext: number
  stats: {
    strength: number
    intelligence: number
    vitality: number
    agility: number
  }
}

interface Goal {
  id: string
  title: string
  description?: string
  category: string
  targetValue: number
  currentValue: number
  unit?: string
  deadline?: string
  priority: string
  status: string
}

interface Quest {
  id: string
  title: string
  description: string
  type: string
  expReward: number
  progress: number
  status: string
}

interface Course {
  id: string
  title: string
  description?: string
  provider: string
  progress: number
  timeSpent: number
  lastAccessed?: string
}

interface Workout {
  id: string
  title: string
  description?: string
  type: string
  duration: number
  difficulty: string
  calories?: number
  createdAt: string
}

export default function SystemInterface() {
  const [userStats, setUserStats] = useState<UserStats>({
    level: 1,
    exp: 0,
    expToNext: 100,
    stats: {
      strength: 10,
      intelligence: 10,
      vitality: 10,
      agility: 10
    }
  })

  const [goals, setGoals] = useState<Goal[]>([])
  const [quests, setQuests] = useState<Quest[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [workouts, setWorkouts] = useState<Workout[]>([])

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'general',
    targetValue: 1,
    unit: '',
    priority: 'medium'
  })

  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    url: '',
    provider: 'udemy'
  })

  const [newWorkout, setNewWorkout] = useState({
    title: '',
    description: '',
    type: 'strength',
    duration: 30,
    difficulty: 'medium',
    calories: 0
  })

  // Initialize with sample data
  useEffect(() => {
    setGoals([
      {
        id: '1',
        title: 'Complete Udemy Course',
        description: 'Finish the Next.js course',
        category: 'learning',
        targetValue: 100,
        currentValue: 35,
        unit: '%',
        priority: 'high',
        status: 'active'
      },
      {
        id: '2',
        title: 'Daily Workout',
        description: 'Exercise for 30 minutes daily',
        category: 'fitness',
        targetValue: 30,
        currentValue: 30,
        unit: 'minutes',
        priority: 'medium',
        status: 'completed'
      }
    ])

    setQuests([
      {
        id: '1',
        title: 'Daily Training',
        description: 'Complete one workout session',
        type: 'daily',
        expReward: 20,
        progress: 100,
        status: 'completed'
      },
      {
        id: '2',
        title: 'Knowledge Seeker',
        description: 'Spend 1 hour learning',
        type: 'daily',
        expReward: 15,
        progress: 60,
        status: 'active'
      },
      {
        id: '3',
        title: 'Goal Setter',
        description: 'Create 3 new goals',
        type: 'weekly',
        expReward: 50,
        progress: 33,
        status: 'active'
      }
    ])

    setCourses([
      {
        id: '1',
        title: 'Next.js Complete Course',
        description: 'Learn Next.js from scratch',
        provider: 'udemy',
        progress: 35,
        timeSpent: 120,
        lastAccessed: '2024-01-15'
      }
    ])

    setWorkouts([
      {
        id: '1',
        title: 'Morning Strength Training',
        description: 'Full body workout',
        type: 'strength',
        duration: 45,
        difficulty: 'medium',
        calories: 300,
        createdAt: '2024-01-15'
      }
    ])
  }, [])

  const addGoal = () => {
    if (newGoal.title.trim()) {
      const goal: Goal = {
        id: Date.now().toString(),
        ...newGoal,
        currentValue: 0,
        status: 'active'
      }
      setGoals([...goals, goal])
      setNewGoal({
        title: '',
        description: '',
        category: 'general',
        targetValue: 1,
        unit: '',
        priority: 'medium'
      })
    }
  }

  const addCourse = () => {
    if (newCourse.title.trim()) {
      const course: Course = {
        id: Date.now().toString(),
        ...newCourse,
        progress: 0,
        timeSpent: 0
      }
      setCourses([...courses, course])
      setNewCourse({
        title: '',
        description: '',
        url: '',
        provider: 'udemy'
      })
    }
  }

  const addWorkout = () => {
    if (newWorkout.title.trim()) {
      const workout: Workout = {
        id: Date.now().toString(),
        ...newWorkout,
        createdAt: new Date().toISOString()
      }
      setWorkouts([...workouts, workout])
      setNewWorkout({
        title: '',
        description: '',
        type: 'strength',
        duration: 30,
        difficulty: 'medium',
        calories: 0
      })
    }
  }

  const completeQuest = (questId: string) => {
    setQuests(quests.map(quest => 
      quest.id === questId 
        ? { ...quest, status: 'completed', progress: 100 }
        : quest
    ))
    
    // Add exp reward
    const quest = quests.find(q => q.id === questId)
    if (quest) {
      setUserStats(prev => ({
        ...prev,
        exp: prev.exp + quest.expReward
      }))
    }
  }

  const updateGoalProgress = (goalId: string, value: number) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        const newValue = Math.min(value, goal.targetValue)
        const status = newValue >= goal.targetValue ? 'completed' : 'active'
        return { ...goal, currentValue: newValue, status }
      }
      return goal
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            SYSTEM INTERFACE
          </h1>
          <p className="text-gray-400">Welcome, Hunter. Level up your life.</p>
        </div>

        {/* User Stats */}
        <Card className="mb-8 bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Hunter Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">Lv.{userStats.level}</div>
                <div className="text-sm text-gray-400">Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{userStats.exp}/{userStats.expToNext}</div>
                <div className="text-sm text-gray-400">EXP</div>
                <Progress value={(userStats.exp / userStats.expToNext) * 100} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{userStats.stats.strength}</div>
                <div className="text-sm text-gray-400">Strength</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{userStats.stats.intelligence}</div>
                <div className="text-sm text-gray-400">Intelligence</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="quests" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="quests" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Quests
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="workouts" className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              Workouts
            </TabsTrigger>
          </TabsList>

          {/* Quests Tab */}
          <TabsContent value="quests" className="space-y-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Active Quests
                </CardTitle>
                <CardDescription>Complete quests to earn EXP and level up</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quests.map((quest) => (
                    <Card key={quest.id} className="bg-gray-700/50 border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{quest.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant={quest.type === 'daily' ? 'default' : 'secondary'}>
                              {quest.type}
                            </Badge>
                            <Badge variant="outline" className="text-yellow-400">
                              +{quest.expReward} EXP
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{quest.description}</p>
                        <div className="flex items-center justify-between">
                          <Progress value={quest.progress} className="flex-1 mr-4" />
                          <span className="text-sm text-gray-400">{quest.progress}%</span>
                          {quest.status === 'active' && quest.progress === 100 && (
                            <Button 
                              size="sm" 
                              onClick={() => completeQuest(quest.id)}
                              className="ml-4 bg-green-600 hover:bg-green-700"
                            >
                              Complete
                            </Button>
                          )}
                          {quest.status === 'completed' && (
                            <CheckCircle className="w-5 h-5 text-green-400 ml-4" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Goals
                </CardTitle>
                <CardDescription>Track your progress towards your objectives</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Goal
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-gray-700">
                      <DialogHeader>
                        <DialogTitle>Create New Goal</DialogTitle>
                        <DialogDescription>Set a new goal to track your progress</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Goal title"
                          value={newGoal.title}
                          onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                          className="bg-gray-700 border-gray-600"
                        />
                        <Textarea
                          placeholder="Description (optional)"
                          value={newGoal.description}
                          onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                          className="bg-gray-700 border-gray-600"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Select value={newGoal.category} onValueChange={(value) => setNewGoal({...newGoal, category: value})}>
                            <SelectTrigger className="bg-gray-700 border-gray-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="learning">Learning</SelectItem>
                              <SelectItem value="fitness">Fitness</SelectItem>
                              <SelectItem value="career">Career</SelectItem>
                              <SelectItem value="personal">Personal</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={newGoal.priority} onValueChange={(value) => setNewGoal({...newGoal, priority: value})}>
                            <SelectTrigger className="bg-gray-700 border-gray-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            type="number"
                            placeholder="Target value"
                            value={newGoal.targetValue}
                            onChange={(e) => setNewGoal({...newGoal, targetValue: parseInt(e.target.value) || 1})}
                            className="bg-gray-700 border-gray-600"
                          />
                          <Input
                            placeholder="Unit (e.g., pages, minutes)"
                            value={newGoal.unit}
                            onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})}
                            className="bg-gray-700 border-gray-600"
                          />
                        </div>
                        <Button onClick={addGoal} className="w-full bg-green-600 hover:bg-green-700">
                          Create Goal
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {goals.map((goal) => (
                    <Card key={goal.id} className="bg-gray-700/50 border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{goal.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{goal.category}</Badge>
                            <Badge variant={goal.priority === 'high' ? 'destructive' : goal.priority === 'medium' ? 'default' : 'secondary'}>
                              {goal.priority}
                            </Badge>
                            {goal.status === 'completed' && (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            )}
                          </div>
                        </div>
                        {goal.description && (
                          <p className="text-sm text-gray-400 mb-3">{goal.description}</p>
                        )}
                        <div className="flex items-center justify-between mb-2">
                          <Progress value={(goal.currentValue / goal.targetValue) * 100} className="flex-1 mr-4" />
                          <span className="text-sm text-gray-400">
                            {goal.currentValue}/{goal.targetValue} {goal.unit}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="Update progress"
                            className="flex-1 bg-gray-600 border-gray-500"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const value = parseInt((e.target as HTMLInputElement).value) || 0
                                updateGoalProgress(goal.id, value)
                                ;(e.target as HTMLInputElement).value = ''
                              }
                            }}
                          />
                          <Button 
                            size="sm"
                            onClick={() => {
                              const input = document.querySelector(`input[placeholder="Update progress"]`) as HTMLInputElement
                              const value = parseInt(input?.value || '0') || 0
                              updateGoalProgress(goal.id, value)
                              if (input) input.value = ''
                            }}
                          >
                            Update
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  Courses
                </CardTitle>
                <CardDescription>Track your learning progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Course
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-gray-700">
                      <DialogHeader>
                        <DialogTitle>Add New Course</DialogTitle>
                        <DialogDescription>Add a course to track your learning progress</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Course title"
                          value={newCourse.title}
                          onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                          className="bg-gray-700 border-gray-600"
                        />
                        <Textarea
                          placeholder="Description (optional)"
                          value={newCourse.description}
                          onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                          className="bg-gray-700 border-gray-600"
                        />
                        <Input
                          placeholder="Udemy course URL"
                          value={newCourse.url}
                          onChange={(e) => setNewCourse({...newCourse, url: e.target.value})}
                          className="bg-gray-700 border-gray-600"
                        />
                        <Select value={newCourse.provider} onValueChange={(value) => setNewCourse({...newCourse, provider: value})}>
                          <SelectTrigger className="bg-gray-700 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="udemy">Udemy</SelectItem>
                            <SelectItem value="coursera">Coursera</SelectItem>
                            <SelectItem value="edx">edX</SelectItem>
                            <SelectItem value="youtube">YouTube</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button onClick={addCourse} className="w-full bg-blue-600 hover:bg-blue-700">
                          Add Course
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {courses.map((course) => (
                    <Card key={course.id} className="bg-gray-700/50 border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{course.title}</h3>
                          <Badge variant="outline">{course.provider}</Badge>
                        </div>
                        {course.description && (
                          <p className="text-sm text-gray-400 mb-3">{course.description}</p>
                        )}
                        <div className="flex items-center justify-between mb-2">
                          <Progress value={course.progress} className="flex-1 mr-4" />
                          <span className="text-sm text-gray-400">{course.progress}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {course.timeSpent} minutes
                          </span>
                          {course.lastAccessed && (
                            <span>Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workouts Tab */}
          <TabsContent value="workouts" className="space-y-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-red-400" />
                  Workouts
                </CardTitle>
                <CardDescription>Track your training sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-red-600 hover:bg-red-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Log Workout
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-gray-700">
                      <DialogHeader>
                        <DialogTitle>Log New Workout</DialogTitle>
                        <DialogDescription>Record your training session</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Workout title"
                          value={newWorkout.title}
                          onChange={(e) => setNewWorkout({...newWorkout, title: e.target.value})}
                          className="bg-gray-700 border-gray-600"
                        />
                        <Textarea
                          placeholder="Description (optional)"
                          value={newWorkout.description}
                          onChange={(e) => setNewWorkout({...newWorkout, description: e.target.value})}
                          className="bg-gray-700 border-gray-600"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Select value={newWorkout.type} onValueChange={(value) => setNewWorkout({...newWorkout, type: value})}>
                            <SelectTrigger className="bg-gray-700 border-gray-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="strength">Strength</SelectItem>
                              <SelectItem value="cardio">Cardio</SelectItem>
                              <SelectItem value="flexibility">Flexibility</SelectItem>
                              <SelectItem value="sports">Sports</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={newWorkout.difficulty} onValueChange={(value) => setNewWorkout({...newWorkout, difficulty: value})}>
                            <SelectTrigger className="bg-gray-700 border-gray-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            type="number"
                            placeholder="Duration (minutes)"
                            value={newWorkout.duration}
                            onChange={(e) => setNewWorkout({...newWorkout, duration: parseInt(e.target.value) || 30})}
                            className="bg-gray-700 border-gray-600"
                          />
                          <Input
                            type="number"
                            placeholder="Calories burned"
                            value={newWorkout.calories}
                            onChange={(e) => setNewWorkout({...newWorkout, calories: parseInt(e.target.value) || 0})}
                            className="bg-gray-700 border-gray-600"
                          />
                        </div>
                        <Button onClick={addWorkout} className="w-full bg-red-600 hover:bg-red-700">
                          Log Workout
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {workouts.map((workout) => (
                    <Card key={workout.id} className="bg-gray-700/50 border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{workout.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{workout.type}</Badge>
                            <Badge variant={workout.difficulty === 'hard' ? 'destructive' : workout.difficulty === 'medium' ? 'default' : 'secondary'}>
                              {workout.difficulty}
                            </Badge>
                          </div>
                        </div>
                        {workout.description && (
                          <p className="text-sm text-gray-400 mb-3">{workout.description}</p>
                        )}
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {workout.duration} minutes
                          </span>
                          {workout.calories && (
                            <span className="flex items-center gap-1">
                              <Zap className="w-4 h-4" />
                              {workout.calories} calories
                            </span>
                          )}
                          <span>{new Date(workout.createdAt).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}