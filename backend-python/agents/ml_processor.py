import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.cluster import KMeans
from sklearn.metrics import accuracy_score, mean_squared_error, silhouette_score
import warnings
warnings.filterwarnings('ignore')

class MLProcessor:
    def __init__(self):
        self.name = "ML Processor"
        self.supported_tasks = [
            "classification", "regression", "clustering", 
            "anomaly_detection", "feature_importance"
        ]
    
    async def process_ml_task(
        self, 
        data: List[Dict], 
        task_type: str = "classification",
        target: Optional[str] = None
    ) -> Dict[str, Any]:
        
        try:
            df = pd.DataFrame(data)
            
            if df.empty:
                return self._empty_data_response()
            
            if task_type == "classification":
                return self._classification_task(df, target)
            elif task_type == "regression":
                return self._regression_task(df, target)
            elif task_type == "clustering":
                return self._clustering_task(df)
            elif task_type == "anomaly_detection":
                return self._anomaly_detection_task(df)
            elif task_type == "feature_importance":
                return self._feature_importance_task(df, target)
            else:
                return self._classification_task(df, target)
                
        except Exception as e:
            return {
                "error": str(e),
                "model_type": "none",
                "results": "ML processing failed",
                "metrics": {}
            }
    
    def _classification_task(self, df: pd.DataFrame, target: Optional[str] = None) -> Dict[str, Any]:
        if target is None or target not in df.columns:
            # Try to auto-detect target column
            categorical_cols = df.select_dtypes(include=['object', 'category']).columns
            if len(categorical_cols) > 0:
                target = categorical_cols[0]
            else:
                return {
                    "error": "No target variable specified or found",
                    "model_type": "classification",
                    "results": "Classification requires a target variable",
                    "metrics": {}
                }
        
        try:
            # Prepare features and target
            X, y, feature_names, label_encoder = self._prepare_classification_data(df, target)
            
            if len(X) < 10:
                return {
                    "error": "Insufficient data for classification",
                    "model_type": "classification", 
                    "results": "Need at least 10 samples for reliable classification",
                    "metrics": {}
                }
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.3, random_state=42, stratify=y if len(np.unique(y)) > 1 else None
            )
            
            # Train model
            model = RandomForestClassifier(n_estimators=100, random_state=42)
            model.fit(X_train, y_train)
            
            # Make predictions
            y_pred = model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            
            # Feature importance
            feature_importance = dict(zip(feature_names, model.feature_importances_))
            
            # Generate predictions for all data
            all_predictions = model.predict(X)
            if label_encoder:
                all_predictions = label_encoder.inverse_transform(all_predictions)
            
            return {
                "model_type": "Random Forest Classifier",
                "results": f"Classification model trained with {accuracy:.3f} accuracy",
                "metrics": {
                    "accuracy": accuracy,
                    "train_samples": len(X_train),
                    "test_samples": len(X_test),
                    "n_classes": len(np.unique(y))
                },
                "predictions": all_predictions.tolist(),
                "feature_importance": feature_importance
            }
            
        except Exception as e:
            return {
                "error": f"Classification failed: {str(e)}",
                "model_type": "classification",
                "results": "Classification processing error",
                "metrics": {}
            }
    
    def _regression_task(self, df: pd.DataFrame, target: Optional[str] = None) -> Dict[str, Any]:
        if target is None:
            # Auto-detect numeric target
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) > 0:
                target = numeric_cols[0]
            else:
                return {
                    "error": "No numeric target variable found",
                    "model_type": "regression",
                    "results": "Regression requires a numeric target variable",
                    "metrics": {}
                }
        
        try:
            # Prepare data
            X, y, feature_names = self._prepare_regression_data(df, target)
            
            if len(X) < 10:
                return {
                    "error": "Insufficient data for regression",
                    "model_type": "regression",
                    "results": "Need at least 10 samples for reliable regression",
                    "metrics": {}
                }
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.3, random_state=42
            )
            
            # Train model
            model = RandomForestRegressor(n_estimators=100, random_state=42)
            model.fit(X_train, y_train)
            
            # Make predictions
            y_pred = model.predict(X_test)
            mse = mean_squared_error(y_test, y_pred)
            rmse = np.sqrt(mse)
            
            # Feature importance
            feature_importance = dict(zip(feature_names, model.feature_importances_))
            
            # Predictions for all data
            all_predictions = model.predict(X)
            
            return {
                "model_type": "Random Forest Regressor",
                "results": f"Regression model trained with RMSE of {rmse:.3f}",
                "metrics": {
                    "mse": mse,
                    "rmse": rmse,
                    "train_samples": len(X_train),
                    "test_samples": len(X_test)
                },
                "predictions": all_predictions.tolist(),
                "feature_importance": feature_importance
            }
            
        except Exception as e:
            return {
                "error": f"Regression failed: {str(e)}",
                "model_type": "regression", 
                "results": "Regression processing error",
                "metrics": {}
            }
    
    def _clustering_task(self, df: pd.DataFrame) -> Dict[str, Any]:
        try:
            # Prepare numeric data only
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            
            if len(numeric_cols) == 0:
                return {
                    "error": "No numeric variables found for clustering",
                    "model_type": "clustering",
                    "results": "Clustering requires numeric variables",
                    "metrics": {}
                }
            
            X = df[numeric_cols].fillna(df[numeric_cols].mean())
            
            if len(X) < 6:
                return {
                    "error": "Insufficient data for clustering",
                    "model_type": "clustering",
                    "results": "Need at least 6 samples for clustering",
                    "metrics": {}
                }
            
            # Standardize data
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            
            # Determine optimal number of clusters (max 5)
            max_clusters = min(5, len(X) // 2)
            best_k = 2
            best_score = -1
            
            for k in range(2, max_clusters + 1):
                try:
                    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
                    cluster_labels = kmeans.fit_predict(X_scaled)
                    score = silhouette_score(X_scaled, cluster_labels)
                    if score > best_score:
                        best_score = score
                        best_k = k
                except:
                    continue
            
            # Final clustering with best k
            kmeans = KMeans(n_clusters=best_k, random_state=42, n_init=10)
            cluster_labels = kmeans.fit_predict(X_scaled)
            silhouette = silhouette_score(X_scaled, cluster_labels)
            
            # Cluster centers in original scale
            centers = scaler.inverse_transform(kmeans.cluster_centers_)
            
            return {
                "model_type": "K-Means Clustering",
                "results": f"Identified {best_k} clusters with silhouette score {silhouette:.3f}",
                "metrics": {
                    "n_clusters": best_k,
                    "silhouette_score": silhouette,
                    "inertia": kmeans.inertia_
                },
                "predictions": cluster_labels.tolist(),
                "feature_importance": {
                    col: f"Cluster center range: {centers[:, i].min():.2f} - {centers[:, i].max():.2f}"
                    for i, col in enumerate(numeric_cols)
                }
            }
            
        except Exception as e:
            return {
                "error": f"Clustering failed: {str(e)}",
                "model_type": "clustering",
                "results": "Clustering processing error", 
                "metrics": {}
            }
    
    def _prepare_classification_data(self, df: pd.DataFrame, target: str):
        # Separate features and target
        y = df[target].copy()
        X_df = df.drop(columns=[target])
        
        # Handle categorical target
        label_encoder = None
        if y.dtype == 'object' or y.dtype.name == 'category':
            label_encoder = LabelEncoder()
            y = label_encoder.fit_transform(y.astype(str))
        
        # Prepare features
        X, feature_names = self._prepare_features(X_df)
        
        return X, y, feature_names, label_encoder
    
    def _prepare_regression_data(self, df: pd.DataFrame, target: str):
        # Separate features and target
        y = df[target].values
        X_df = df.drop(columns=[target])
        
        # Prepare features
        X, feature_names = self._prepare_features(X_df)
        
        return X, y, feature_names
    
    def _prepare_features(self, X_df: pd.DataFrame):
        feature_names = []
        X_processed = []
        
        for col in X_df.columns:
            if X_df[col].dtype in ['object', 'category']:
                # Handle categorical variables
                le = LabelEncoder()
                try:
                    encoded = le.fit_transform(X_df[col].astype(str))
                    X_processed.append(encoded)
                    feature_names.append(f"{col}_encoded")
                except:
                    continue
            else:
                # Handle numeric variables
                values = X_df[col].fillna(X_df[col].mean()).values
                X_processed.append(values)
                feature_names.append(col)
        
        if not X_processed:
            raise ValueError("No processable features found")
        
        X = np.column_stack(X_processed)
        return X, feature_names
    
    def _anomaly_detection_task(self, df: pd.DataFrame) -> Dict[str, Any]:
        # Simplified anomaly detection using IQR method
        try:
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            
            if len(numeric_cols) == 0:
                return {
                    "error": "No numeric variables for anomaly detection",
                    "model_type": "anomaly_detection",
                    "results": "Anomaly detection requires numeric variables",
                    "metrics": {}
                }
            
            anomalies = []
            for col in numeric_cols:
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                
                col_anomalies = ((df[col] < lower_bound) | (df[col] > upper_bound)).sum()
                anomalies.append(col_anomalies)
            
            total_anomalies = sum(anomalies)
            anomaly_rate = total_anomalies / len(df) if len(df) > 0 else 0
            
            return {
                "model_type": "IQR Anomaly Detection",
                "results": f"Detected {total_anomalies} potential anomalies ({anomaly_rate:.2%} of data)",
                "metrics": {
                    "total_anomalies": total_anomalies,
                    "anomaly_rate": anomaly_rate,
                    "variables_checked": len(numeric_cols)
                },
                "predictions": [],
                "feature_importance": dict(zip(numeric_cols, anomalies))
            }
            
        except Exception as e:
            return {
                "error": f"Anomaly detection failed: {str(e)}",
                "model_type": "anomaly_detection",
                "results": "Anomaly detection processing error",
                "metrics": {}
            }
    
    def _feature_importance_task(self, df: pd.DataFrame, target: Optional[str] = None) -> Dict[str, Any]:
        # Use classification or regression to get feature importance
        if target is None or target not in df.columns:
            return {
                "error": "Target variable required for feature importance analysis", 
                "model_type": "feature_importance",
                "results": "Specify a target variable to analyze feature importance",
                "metrics": {}
            }
        
        # Determine if classification or regression based on target
        if df[target].dtype in ['object', 'category'] or df[target].nunique() < 10:
            return self._classification_task(df, target)
        else:
            return self._regression_task(df, target)
    
    def _empty_data_response(self) -> Dict[str, Any]:
        return {
            "error": "No data provided",
            "model_type": "none",
            "results": "Please provide data for ML processing",
            "metrics": {}
        }