"""
Data Scientist — Career Path Catalog
=====================================
From Python basics through statistics, machine learning,
deep learning, and MLOps. A complete path to becoming a
data professional who can extract insights and build models.

Modules: 14 (hard skills + soft skills + capstone)
"""

DATA_SCIENTIST = {
    "role": "data",
    "title": "Data Scientist",
    "description": "From Python basics through statistics, machine learning, deep learning, and MLOps. Extract insights from data and build models that solve real problems.",
    "modules": [
        # ── 0  Python for Data Science ────────────────────────────
        {
            "label": "Python for Data Science",
            "description": "Python is the lingua franca of data science. Learn the language foundations and key libraries used in every data workflow.",
            "market_value": "Low-Med",
            "node_type": "core",
            "connections": [1, 2],
            "project_prompt": "Write Python scripts that clean a messy CSV, calculate summary statistics, and output a clean dataset — using only the standard library plus csv module.",
            "resources": {
                "primary": [
                    {"title": "Python Official Tutorial", "url": "https://docs.python.org/3/tutorial/", "type": "docs"},
                    {"title": "FreeCodeCamp Python for Data Science", "url": "https://www.freecodecamp.org/learn/data-analysis-with-python/", "type": "interactive"},
                ],
                "additional": [
                    {"title": "Real Python Tutorials", "url": "https://realpython.com/", "type": "docs"},
                    {"title": "Corey Schafer Python YouTube", "url": "https://www.youtube.com/@coreyms", "type": "video"},
                    {"title": "Automate the Boring Stuff", "url": "https://automatetheboringstuff.com/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Python Setup & Jupyter", "description": "Installing Python, pip, Jupyter Notebook/Lab, virtual environments.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Variables & Data Types", "description": "Strings, ints, floats, booleans, lists, dicts, tuples.", "phase": 1, "order": 2, "estimated_minutes": 20},
                {"title": "Control Flow & Loops", "description": "if/else, for, while, list comprehensions.", "phase": 1, "order": 3, "estimated_minutes": 25},
                {"title": "Functions & Lambda", "description": "def, return, lambda, map/filter, *args/**kwargs.", "phase": 1, "order": 4, "estimated_minutes": 25},
                {"title": "Working with Files", "description": "Reading CSV, JSON, text files, context managers.", "phase": 2, "order": 5, "estimated_minutes": 20},
                {"title": "String Manipulation & Regex", "description": "f-strings, split, join, regular expressions for cleaning.", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "Error Handling", "description": "try/except, custom exceptions, debugging.", "phase": 2, "order": 7, "estimated_minutes": 20},
                {"title": "Object-Oriented Basics", "description": "Classes for organizing data pipelines, __init__, methods.", "phase": 3, "order": 8, "estimated_minutes": 25},
                {"title": "Modules & Packages", "description": "Importing, pip install, requirements.txt, virtual envs.", "phase": 3, "order": 9, "estimated_minutes": 15},
                {"title": "Python Best Practices", "description": "PEP 8, type hints, docstrings, linting.", "phase": 3, "order": 10, "estimated_minutes": 20},
            ],
        },

        # ── 1  Statistics & Probability ───────────────────────────
        {
            "label": "Statistics & Probability",
            "description": "The mathematical foundation of data science. Understand distributions, hypothesis testing, correlation, and Bayesian thinking.",
            "market_value": "Med",
            "node_type": "core",
            "connections": [3, 4],
            "project_prompt": "Analyze a real-world dataset: calculate descriptive statistics, run hypothesis tests, build confidence intervals, and write a statistical report.",
            "resources": {
                "primary": [
                    {"title": "Khan Academy Statistics", "url": "https://www.khanacademy.org/math/statistics-probability", "type": "interactive"},
                    {"title": "StatQuest YouTube", "url": "https://www.youtube.com/@statquest", "type": "video"},
                ],
                "additional": [
                    {"title": "3Blue1Brown Probability", "url": "https://www.youtube.com/playlist?list=PLZHQObOWTQDOjmo3Y6ADm0ScWAlEXf-fp", "type": "video"},
                    {"title": "Think Stats (free book)", "url": "https://greenteapress.com/thinkstats2/html/index.html", "type": "docs"},
                    {"title": "Seeing Theory (visual)", "url": "https://seeing-theory.brown.edu/", "type": "interactive"},
                ],
            },
            "lessons": [
                {"title": "Descriptive Statistics", "description": "Mean, median, mode, variance, standard deviation, percentiles.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Probability Fundamentals", "description": "Sample space, events, conditional probability, Bayes' theorem.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "Probability Distributions", "description": "Normal, binomial, Poisson, uniform — when to use each.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "Central Limit Theorem", "description": "Sampling distributions, why the CLT matters, simulations.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "Hypothesis Testing", "description": "Null/alternative hypotheses, p-values, t-tests, chi-squared.", "phase": 2, "order": 5, "estimated_minutes": 35},
                {"title": "Confidence Intervals", "description": "Z-intervals, t-intervals, interpreting confidence levels.", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "Correlation & Regression Intro", "description": "Pearson, Spearman, simple linear regression, R-squared.", "phase": 3, "order": 7, "estimated_minutes": 30},
                {"title": "A/B Testing", "description": "Experiment design, sample size, statistical significance.", "phase": 3, "order": 8, "estimated_minutes": 25},
                {"title": "Bayesian Thinking", "description": "Prior, likelihood, posterior — intuitive Bayesian reasoning.", "phase": 3, "order": 9, "estimated_minutes": 25},
            ],
        },

        # ── 2  Git & Version Control for Data ─────────────────────
        {
            "label": "Git & Version Control for Data",
            "description": "Track your code, notebooks, and experiments. Git, GitHub, and data versioning tools for reproducible data science.",
            "market_value": "Low-Med",
            "node_type": "core",
            "connections": [3],
            "project_prompt": "Set up a data science project repo with proper .gitignore, notebook versioning, DVC for data tracking, and clear documentation.",
            "resources": {
                "primary": [
                    {"title": "Learn Git Branching", "url": "https://learngitbranching.js.org/", "type": "interactive"},
                    {"title": "DVC (Data Version Control)", "url": "https://dvc.org/doc/start", "type": "docs"},
                ],
                "additional": [
                    {"title": "GitHub Skills", "url": "https://skills.github.com/", "type": "interactive"},
                    {"title": "Cookiecutter Data Science", "url": "https://drivendata.github.io/cookiecutter-data-science/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Git Basics for Data Science", "description": "init, add, commit, .gitignore for data files and notebooks.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Branching & Collaboration", "description": "Feature branches, PRs, managing Jupyter diffs.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "GitHub for Data Projects", "description": "README templates, project structure, sharing notebooks.", "phase": 2, "order": 3, "estimated_minutes": 20},
                {"title": "Data Versioning with DVC", "description": "Tracking datasets, remote storage, reproducible pipelines.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "Experiment Tracking", "description": "MLflow basics, logging metrics, comparing runs.", "phase": 3, "order": 5, "estimated_minutes": 25},
                {"title": "Reproducible Projects", "description": "Cookiecutter, environment files, make/dvc pipelines.", "phase": 3, "order": 6, "estimated_minutes": 25},
            ],
        },

        # ── 3  Pandas & NumPy ─────────────────────────────────────
        {
            "label": "Pandas & NumPy",
            "description": "The core tools of data manipulation. Master DataFrames, Series, array operations, and efficient data wrangling patterns.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [4, 5],
            "project_prompt": "Clean and analyze a messy real-world dataset (at least 10,000 rows): handle missing data, merge tables, compute group statistics, and export results.",
            "resources": {
                "primary": [
                    {"title": "Pandas Official Docs", "url": "https://pandas.pydata.org/docs/getting_started/intro_tutorials/index.html", "type": "docs"},
                    {"title": "Kaggle Pandas Course", "url": "https://www.kaggle.com/learn/pandas", "type": "interactive"},
                ],
                "additional": [
                    {"title": "NumPy Official Tutorial", "url": "https://numpy.org/doc/stable/user/quickstart.html", "type": "docs"},
                    {"title": "Real Python Pandas Tutorial", "url": "https://realpython.com/pandas-python-explore-dataset/", "type": "docs"},
                    {"title": "Corey Schafer Pandas YouTube", "url": "https://www.youtube.com/playlist?list=PL-osiE80TeTsWmV9i9c58mdDCSskIFdDS", "type": "video"},
                ],
            },
            "lessons": [
                {"title": "NumPy Arrays", "description": "Creating arrays, shapes, dtypes, indexing, broadcasting.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "NumPy Operations", "description": "Vectorized ops, ufuncs, aggregation, linear algebra basics.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Pandas Series & DataFrame", "description": "Creating, indexing, loc/iloc, dtypes, info, describe.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "Data Selection & Filtering", "description": "Boolean indexing, query, isin, between, chaining conditions.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "Handling Missing Data", "description": "isna, fillna, dropna, interpolation strategies.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "GroupBy & Aggregation", "description": "groupby, agg, transform, pivot tables, crosstab.", "phase": 2, "order": 6, "estimated_minutes": 30},
                {"title": "Merging & Joining", "description": "merge, concat, join — combining datasets, handling keys.", "phase": 2, "order": 7, "estimated_minutes": 25},
                {"title": "Data Cleaning Patterns", "description": "Renaming, type conversion, string methods, duplicates.", "phase": 3, "order": 8, "estimated_minutes": 25},
                {"title": "Time Series with Pandas", "description": "DatetimeIndex, resampling, rolling windows, date math.", "phase": 3, "order": 9, "estimated_minutes": 30},
                {"title": "Performance & Large Data", "description": "Memory optimization, dtypes, chunked reading, Polars intro.", "phase": 3, "order": 10, "estimated_minutes": 25},
            ],
        },

        # ── 4  Data Visualization ─────────────────────────────────
        {
            "label": "Data Visualization",
            "description": "Tell stories with data. Master Matplotlib, Seaborn, and Plotly to create publication-quality charts and interactive dashboards.",
            "market_value": "Med",
            "node_type": "core",
            "connections": [6],
            "project_prompt": "Create a data visualization portfolio: 5 static charts (Matplotlib/Seaborn) and 3 interactive dashboards (Plotly) from a real dataset. Publish as a blog post.",
            "resources": {
                "primary": [
                    {"title": "Matplotlib Official Tutorials", "url": "https://matplotlib.org/stable/tutorials/index.html", "type": "docs"},
                    {"title": "Seaborn Official Gallery", "url": "https://seaborn.pydata.org/examples/index.html", "type": "docs"},
                ],
                "additional": [
                    {"title": "Plotly Python Docs", "url": "https://plotly.com/python/", "type": "docs"},
                    {"title": "Storytelling with Data (summary)", "url": "https://www.youtube.com/watch?v=8EMW7io4rSI", "type": "video"},
                    {"title": "From Data to Viz", "url": "https://www.data-to-viz.com/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Matplotlib Basics", "description": "Figure, axes, plot, scatter, bar, configuring styles.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Customizing Charts", "description": "Labels, legends, colors, annotations, subplots.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Seaborn Statistical Plots", "description": "histplot, boxplot, violinplot, heatmap, pairplot.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "Seaborn Advanced", "description": "FacetGrid, catplot, regplot, styling themes.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "Choosing the Right Chart", "description": "Bar vs line vs scatter vs pie — data-driven decisions.", "phase": 2, "order": 5, "estimated_minutes": 20},
                {"title": "Interactive Plots with Plotly", "description": "plotly.express, hover info, zoom, export to HTML.", "phase": 2, "order": 6, "estimated_minutes": 30},
                {"title": "Dashboards with Plotly Dash", "description": "Layout, callbacks, interactive filters, deploying dashboards.", "phase": 3, "order": 7, "estimated_minutes": 35},
                {"title": "Data Storytelling", "description": "Narrative structure, highlighting insights, presentation design.", "phase": 3, "order": 8, "estimated_minutes": 25},
            ],
        },

        # ── 5  SQL for Data Analysis ──────────────────────────────
        {
            "label": "SQL for Data Analysis",
            "description": "Most business data lives in databases. Write analytical SQL queries to extract, transform, and analyze data at scale.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [6],
            "project_prompt": "Analyze a relational database with 5+ tables: write 15 analytical queries including window functions, CTEs, and date-based aggregations.",
            "resources": {
                "primary": [
                    {"title": "SQLBolt", "url": "https://sqlbolt.com/", "type": "interactive"},
                    {"title": "Mode Analytics SQL Tutorial", "url": "https://mode.com/sql-tutorial/", "type": "interactive"},
                ],
                "additional": [
                    {"title": "Kaggle SQL Course", "url": "https://www.kaggle.com/learn/intro-to-sql", "type": "interactive"},
                    {"title": "W3Schools SQL", "url": "https://www.w3schools.com/sql/", "type": "docs"},
                    {"title": "SQL Window Functions Explained", "url": "https://www.youtube.com/watch?v=MHkl6RsUAds", "type": "video"},
                ],
            },
            "lessons": [
                {"title": "SQL Fundamentals", "description": "SELECT, FROM, WHERE, ORDER BY, LIMIT — querying data.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Filtering & Sorting", "description": "LIKE, IN, BETWEEN, IS NULL, multiple conditions.", "phase": 1, "order": 2, "estimated_minutes": 20},
                {"title": "JOINs for Analysis", "description": "INNER, LEFT, self-joins — combining tables for insights.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "Aggregation & GROUP BY", "description": "COUNT, SUM, AVG, HAVING — summarizing data.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "Subqueries & CTEs", "description": "Nested queries, WITH clause, improving readability.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "Window Functions", "description": "ROW_NUMBER, RANK, LAG, LEAD, running totals, partitions.", "phase": 2, "order": 6, "estimated_minutes": 35},
                {"title": "Date & Time Functions", "description": "DATE_TRUNC, EXTRACT, intervals, time-based analysis.", "phase": 3, "order": 7, "estimated_minutes": 25},
                {"title": "Advanced Analytical SQL", "description": "CASE, COALESCE, pivoting, percentiles, cumulative sums.", "phase": 3, "order": 8, "estimated_minutes": 30},
                {"title": "SQL Performance for Data", "description": "EXPLAIN, indexes, partitioning, optimizing analytical queries.", "phase": 3, "order": 9, "estimated_minutes": 25},
            ],
        },

        # ── 6  Machine Learning Fundamentals ──────────────────────
        {
            "label": "Machine Learning Fundamentals",
            "description": "The core theory and practice of ML. Supervised and unsupervised learning, bias-variance tradeoff, cross-validation, and model evaluation.",
            "market_value": "High",
            "node_type": "core",
            "connections": [7, 8],
            "project_prompt": "Build 3 ML models (regression, classification, clustering) on a Kaggle dataset. Compare performance metrics and write a detailed report.",
            "resources": {
                "primary": [
                    {"title": "Kaggle Intro to ML", "url": "https://www.kaggle.com/learn/intro-to-machine-learning", "type": "interactive"},
                    {"title": "StatQuest ML Playlist", "url": "https://www.youtube.com/playlist?list=PLblh5JKOoLUICTaGLRoHQDuF_7q2GfuJF", "type": "video"},
                ],
                "additional": [
                    {"title": "Google ML Crash Course", "url": "https://developers.google.com/machine-learning/crash-course", "type": "interactive"},
                    {"title": "Scikit-learn User Guide", "url": "https://scikit-learn.org/stable/user_guide.html", "type": "docs"},
                    {"title": "3Blue1Brown Neural Networks", "url": "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi", "type": "video"},
                ],
            },
            "lessons": [
                {"title": "What is Machine Learning?", "description": "Supervised vs unsupervised, types of tasks, the ML workflow.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Linear Regression", "description": "Fitting a line, cost function, gradient descent, R-squared.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "Logistic Regression", "description": "Classification, sigmoid, decision boundary, log loss.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "Train/Test Split & Validation", "description": "Overfitting, cross-validation, k-fold, stratification.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "Decision Trees & Random Forests", "description": "Splitting criteria, pruning, ensemble methods, feature importance.", "phase": 2, "order": 5, "estimated_minutes": 30},
                {"title": "Model Evaluation Metrics", "description": "Accuracy, precision, recall, F1, ROC-AUC, confusion matrix.", "phase": 2, "order": 6, "estimated_minutes": 30},
                {"title": "Feature Engineering", "description": "Encoding, scaling, polynomial features, feature selection.", "phase": 2, "order": 7, "estimated_minutes": 30},
                {"title": "Support Vector Machines", "description": "Hyperplanes, kernels, margin, soft margin classification.", "phase": 3, "order": 8, "estimated_minutes": 25},
                {"title": "Clustering (K-Means, DBSCAN)", "description": "Unsupervised learning, elbow method, silhouette score.", "phase": 3, "order": 9, "estimated_minutes": 25},
                {"title": "Bias-Variance Tradeoff", "description": "Underfitting, overfitting, regularization (L1/L2), tuning.", "phase": 3, "order": 10, "estimated_minutes": 25},
                {"title": "Hyperparameter Tuning", "description": "GridSearchCV, RandomizedSearchCV, Bayesian optimization.", "phase": 3, "order": 11, "estimated_minutes": 25},
            ],
        },

        # ── 7  Scikit-learn Applied ───────────────────────────────
        {
            "label": "Scikit-learn Applied",
            "description": "Put ML theory into practice. Build end-to-end ML pipelines with scikit-learn — from data preprocessing to model deployment.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [9],
            "project_prompt": "Build an end-to-end ML pipeline: data cleaning, feature engineering, model selection, hyperparameter tuning, and a prediction API with Flask.",
            "resources": {
                "primary": [
                    {"title": "Scikit-learn Tutorials", "url": "https://scikit-learn.org/stable/tutorial/index.html", "type": "docs"},
                    {"title": "Kaggle Intermediate ML", "url": "https://www.kaggle.com/learn/intermediate-machine-learning", "type": "interactive"},
                ],
                "additional": [
                    {"title": "Hands-On ML Book (Aurélien Géron)", "url": "https://github.com/ageron/handson-ml3", "type": "docs"},
                    {"title": "Real Python Scikit-learn", "url": "https://realpython.com/python-ai-python-machine-learning/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Scikit-learn Pipeline API", "description": "Pipeline, ColumnTransformer, FunctionTransformer.", "phase": 1, "order": 1, "estimated_minutes": 30},
                {"title": "Preprocessing Transformers", "description": "StandardScaler, OneHotEncoder, OrdinalEncoder, imputers.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Model Selection Framework", "description": "Comparing models, cross_val_score, learning curves.", "phase": 1, "order": 3, "estimated_minutes": 25},
                {"title": "Advanced Ensembles", "description": "GradientBoosting, XGBoost, LightGBM, stacking.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "Dimensionality Reduction", "description": "PCA, t-SNE, UMAP — when and how to reduce features.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "Handling Imbalanced Data", "description": "SMOTE, class weights, threshold tuning, evaluation strategies.", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "Model Serialization", "description": "joblib, pickle, saving/loading models, versioning.", "phase": 3, "order": 7, "estimated_minutes": 20},
                {"title": "Building a Prediction API", "description": "Flask/FastAPI, loading model, input validation, serving predictions.", "phase": 3, "order": 8, "estimated_minutes": 35},
            ],
        },

        # ── 8  Deep Learning Introduction ─────────────────────────
        {
            "label": "Deep Learning Introduction",
            "description": "Neural networks from scratch. Understand backpropagation, build networks with PyTorch, and apply deep learning to real problems.",
            "market_value": "High",
            "node_type": "core",
            "connections": [9],
            "project_prompt": "Build and train a CNN for image classification (e.g., CIFAR-10) with PyTorch. Achieve >85% accuracy. Visualize training curves and confusion matrix.",
            "resources": {
                "primary": [
                    {"title": "fast.ai Practical Deep Learning", "url": "https://course.fast.ai/", "type": "interactive"},
                    {"title": "PyTorch Official Tutorials", "url": "https://pytorch.org/tutorials/", "type": "docs"},
                ],
                "additional": [
                    {"title": "3Blue1Brown Neural Networks", "url": "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi", "type": "video"},
                    {"title": "Deep Learning Book (Goodfellow)", "url": "https://www.deeplearningbook.org/", "type": "docs"},
                    {"title": "Andrej Karpathy YouTube", "url": "https://www.youtube.com/@AndrejKarpathy", "type": "video"},
                ],
            },
            "lessons": [
                {"title": "Neural Network Intuition", "description": "Neurons, layers, activation functions, forward pass.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Backpropagation & Gradient Descent", "description": "Chain rule, loss functions, learning rate, optimization.", "phase": 1, "order": 2, "estimated_minutes": 35},
                {"title": "PyTorch Tensors & Autograd", "description": "Tensor operations, automatic differentiation, GPU acceleration.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "Building a Neural Network", "description": "nn.Module, layers, forward method, training loop.", "phase": 2, "order": 4, "estimated_minutes": 35},
                {"title": "Convolutional Neural Networks", "description": "Conv2d, pooling, feature maps, image classification.", "phase": 2, "order": 5, "estimated_minutes": 35},
                {"title": "Training Best Practices", "description": "Batch normalization, dropout, data augmentation, learning rate scheduling.", "phase": 2, "order": 6, "estimated_minutes": 30},
                {"title": "Transfer Learning", "description": "Pre-trained models, fine-tuning, ResNet, EfficientNet.", "phase": 3, "order": 7, "estimated_minutes": 30},
                {"title": "NLP with Transformers", "description": "Tokenization, attention, Hugging Face, text classification.", "phase": 3, "order": 8, "estimated_minutes": 35},
                {"title": "Recurrent Neural Networks", "description": "LSTM, GRU, sequence modeling, time series forecasting.", "phase": 3, "order": 9, "estimated_minutes": 30},
            ],
        },

        # ── 9  MLOps & Model Deployment ───────────────────────────
        {
            "label": "MLOps & Model Deployment",
            "description": "Ship ML models to production. Experiment tracking, model versioning, APIs, Docker, monitoring, and CI/CD for ML.",
            "market_value": "High",
            "node_type": "core",
            "connections": [10, 11],
            "project_prompt": "Deploy an ML model as a REST API with Docker, add MLflow experiment tracking, set up data drift monitoring, and create a GitHub Actions CI pipeline.",
            "resources": {
                "primary": [
                    {"title": "MLflow Official Docs", "url": "https://mlflow.org/docs/latest/index.html", "type": "docs"},
                    {"title": "Made With ML MLOps", "url": "https://madewithml.com/", "type": "interactive"},
                ],
                "additional": [
                    {"title": "Docker for Data Science", "url": "https://docs.docker.com/guides/data-science/", "type": "docs"},
                    {"title": "FastAPI for ML Serving", "url": "https://fastapi.tiangolo.com/", "type": "docs"},
                    {"title": "Evidently AI (drift monitoring)", "url": "https://www.evidentlyai.com/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "MLOps Overview", "description": "ML lifecycle, technical debt, reproducibility challenges.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Experiment Tracking with MLflow", "description": "Logging params, metrics, artifacts, comparing experiments.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "Model Versioning & Registry", "description": "Model registry, staging/production, artifact storage.", "phase": 1, "order": 3, "estimated_minutes": 25},
                {"title": "Serving Models with FastAPI", "description": "API endpoints, input validation, batch prediction.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "Dockerizing ML Apps", "description": "Dockerfile for ML, managing dependencies, GPU support.", "phase": 2, "order": 5, "estimated_minutes": 30},
                {"title": "Data & Model Monitoring", "description": "Data drift, concept drift, performance degradation alerts.", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "CI/CD for ML", "description": "GitHub Actions, automated training, test pipelines.", "phase": 3, "order": 7, "estimated_minutes": 25},
                {"title": "Feature Stores", "description": "Feast basics, feature pipelines, online/offline stores.", "phase": 3, "order": 8, "estimated_minutes": 25},
            ],
        },

        # ── 10  Natural Language Processing ───────────────────────
        {
            "label": "Natural Language Processing",
            "description": "Make computers understand text. From text preprocessing through transformers, sentiment analysis, and LLM applications.",
            "market_value": "High",
            "node_type": "core",
            "connections": [12, 13],
            "project_prompt": "Build a text classification system (e.g., sentiment analysis or topic categorization) using transformers. Include data preprocessing, model training, evaluation, and a Gradio demo.",
            "resources": {
                "primary": [
                    {"title": "Hugging Face NLP Course", "url": "https://huggingface.co/learn/nlp-course", "type": "interactive"},
                    {"title": "spaCy 101", "url": "https://spacy.io/usage/spacy-101", "type": "docs"},
                ],
                "additional": [
                    {"title": "NLTK Book (free)", "url": "https://www.nltk.org/book/", "type": "docs"},
                    {"title": "Jay Alammar Transformers", "url": "https://jalammar.github.io/illustrated-transformer/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Text Preprocessing", "description": "Tokenization, stemming, lemmatization, stop words, cleaning.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Bag of Words & TF-IDF", "description": "Text vectorization, document-term matrix, TF-IDF weighting.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Word Embeddings", "description": "Word2Vec, GloVe, contextual embeddings, similarity.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "Text Classification", "description": "Naive Bayes, SVM for text, evaluation, multi-class.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "Transformers & Attention", "description": "Self-attention, BERT, GPT — how modern NLP works.", "phase": 2, "order": 5, "estimated_minutes": 35},
                {"title": "Hugging Face Pipelines", "description": "Using pre-trained models, pipeline API, tokenizers.", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "Fine-tuning Transformers", "description": "Transfer learning for NLP, Trainer API, datasets library.", "phase": 3, "order": 7, "estimated_minutes": 35},
                {"title": "Building LLM Applications", "description": "Prompt engineering, RAG basics, LangChain introduction.", "phase": 3, "order": 8, "estimated_minutes": 30},
            ],
        },

        # ── 11  Big Data & Cloud ──────────────────────────────────
        {
            "label": "Big Data & Cloud",
            "description": "Work with data that doesn't fit in memory. Introduction to Spark, cloud platforms (AWS/GCP), and scalable data processing.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [12, 13],
            "project_prompt": "Process a large dataset (>1GB) using PySpark on a cloud platform. Build an ETL pipeline that reads, transforms, and writes to a data warehouse.",
            "resources": {
                "primary": [
                    {"title": "PySpark Official Docs", "url": "https://spark.apache.org/docs/latest/api/python/", "type": "docs"},
                    {"title": "AWS Free Tier", "url": "https://aws.amazon.com/free/", "type": "interactive"},
                ],
                "additional": [
                    {"title": "Databricks Community Edition", "url": "https://community.cloud.databricks.com/", "type": "interactive"},
                    {"title": "Google BigQuery Sandbox", "url": "https://cloud.google.com/bigquery/docs/sandbox", "type": "interactive"},
                    {"title": "Data Engineering Zoomcamp (free)", "url": "https://github.com/DataTalksClub/data-engineering-zoomcamp", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "When Data Gets Big", "description": "Limits of Pandas, distributed computing concepts.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "PySpark Basics", "description": "SparkSession, DataFrames, transformations, actions.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "PySpark SQL & Operations", "description": "SQL queries, joins, aggregations, UDFs in Spark.", "phase": 2, "order": 3, "estimated_minutes": 30},
                {"title": "Cloud Platform Basics", "description": "AWS S3, GCP Cloud Storage, IAM, cost management.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "ETL Pipelines", "description": "Extract, transform, load — building data pipelines.", "phase": 2, "order": 5, "estimated_minutes": 30},
                {"title": "Data Warehouses", "description": "BigQuery, Redshift, Snowflake — analytical databases.", "phase": 3, "order": 6, "estimated_minutes": 25},
                {"title": "Orchestration", "description": "Airflow basics, DAGs, scheduling, monitoring.", "phase": 3, "order": 7, "estimated_minutes": 30},
            ],
        },

        # ── 12  Data Science Capstone ─────────────────────────────
        {
            "label": "Data Science Capstone Project",
            "description": "Build an end-to-end data science project: problem definition, data collection, analysis, ML model, deployment, and presentation.",
            "market_value": "High",
            "node_type": "core",
            "connections": [],
            "project_prompt": "Complete an end-to-end data science project: define a business problem, collect/clean data, perform EDA, build and evaluate ML models, deploy, and present findings.",
            "resources": {
                "primary": [
                    {"title": "Kaggle Competitions", "url": "https://www.kaggle.com/competitions", "type": "interactive"},
                    {"title": "Driven Data Competitions", "url": "https://www.drivendata.org/competitions/", "type": "interactive"},
                ],
                "additional": [
                    {"title": "Data Science Project Template", "url": "https://drivendata.github.io/cookiecutter-data-science/", "type": "docs"},
                    {"title": "Streamlit for Demos", "url": "https://streamlit.io/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Problem Definition & Scoping", "description": "Identifying a problem, defining success metrics, feasibility.", "phase": 1, "order": 1, "estimated_minutes": 35},
                {"title": "Data Collection & Cleaning", "description": "Sourcing data, handling quality issues, documentation.", "phase": 1, "order": 2, "estimated_minutes": 40},
                {"title": "Exploratory Data Analysis (EDA)", "description": "Visualizations, hypothesis generation, feature discovery.", "phase": 2, "order": 3, "estimated_minutes": 45},
                {"title": "Model Building & Evaluation", "description": "Multiple models, cross-validation, final model selection.", "phase": 2, "order": 4, "estimated_minutes": 50},
                {"title": "Model Deployment", "description": "API serving, Streamlit demo, Docker containerization.", "phase": 3, "order": 5, "estimated_minutes": 40},
                {"title": "Presentation & Documentation", "description": "Slide deck, jupyter notebook report, README, demo recording.", "phase": 3, "order": 6, "estimated_minutes": 35},
            ],
        },

        # ── 13  Communication & Career Skills ─────────────────────
        {
            "label": "Communication & Career Skills",
            "description": "Translate data into decisions. Learn to present findings, write reports, collaborate with stakeholders, and ace data science interviews.",
            "market_value": "Med-High",
            "node_type": "soft_skill",
            "connections": [12],
            "project_prompt": "Present a data analysis to a non-technical audience (recorded), write a blog post explaining an ML concept, and contribute to a Kaggle community notebook.",
            "resources": {
                "primary": [
                    {"title": "Storytelling with Data (summary)", "url": "https://www.youtube.com/watch?v=8EMW7io4rSI", "type": "video"},
                    {"title": "Technical Writing (Google)", "url": "https://developers.google.com/tech-writing", "type": "docs"},
                ],
                "additional": [
                    {"title": "STAR Method for Interviews", "url": "https://www.themuse.com/advice/star-interview-method", "type": "docs"},
                    {"title": "Kaggle Notebooks Community", "url": "https://www.kaggle.com/code", "type": "interactive"},
                ],
            },
            "lessons": [
                {"title": "Communicating Data Insights", "description": "Translating analysis into actionable business recommendations.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Building Effective Presentations", "description": "Slide design, narrative flow, executive summaries.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Writing Data Reports", "description": "Jupyter notebooks, markdown, reproducible analysis.", "phase": 2, "order": 3, "estimated_minutes": 25},
                {"title": "Working with Stakeholders", "description": "Understanding business problems, managing expectations.", "phase": 2, "order": 4, "estimated_minutes": 20},
                {"title": "Data Science Interview Prep", "description": "Technical questions, case studies, take-home challenges.", "phase": 3, "order": 5, "estimated_minutes": 30},
                {"title": "Building Your DS Portfolio", "description": "Kaggle profile, blog, GitHub, LinkedIn for data scientists.", "phase": 3, "order": 6, "estimated_minutes": 25},
                {"title": "Ethics in Data Science", "description": "Bias, fairness, privacy, responsible AI practices.", "phase": 3, "order": 7, "estimated_minutes": 20},
            ],
        },
    ],
}
